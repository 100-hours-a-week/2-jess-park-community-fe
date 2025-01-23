import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import multer from 'multer';
import helmet from 'helmet';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

// 비밀 키
const SECRET_KEY = 'your_secret_key';

// CORS 설정
app.use(cors({
    origin: 'http://127.0.0.1:5500',  // 클라이언트 주소
    credentials: true,  // 쿠키 허용
    allowedHeaders: ['Content-Type', 'Authorization'],  // JWT 인증 헤더 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // 허용할 메서드 지정
}));




// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());


// 데이터 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFilePath = path.join(__dirname, 'data', 'users.json');

const upload = multer({ dest: 'uploads/' });

// JWT 인증 미들웨어
const verifyToken = (req, res, next) => {
    let token = req.cookies['token'];  // 🔍 쿠키에서 JWT 가져오기

    console.log('🔍 요청에서 받은 쿠키:', req.cookies);  // ✅ 디버깅용 로그

    if (!token && req.headers['authorization']) {
        const bearerHeader = req.headers['authorization'];
        if (bearerHeader) {
            const bearer = bearerHeader.split(' ');
            token = bearer[1];  
        }
    }

    if (!token) {
        console.warn('⚠️ JWT 토큰이 없습니다.');
        return res.status(401).json({ success: false, message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // ✅ JWT에서 사용자 정보 추출
        console.log('✅ 인증된 사용자:', decoded);
        next();
    } catch (error) {
        console.error('❌ JWT 검증 실패:', error);
        return res.status(401).json({ success: false, message: '유효하지 않은 토큰' });
    }
};







// 데이터 로드 함수
const loadUsers = () => {
    try {
        console.log('🔍 users.json 파일 경로:', usersFilePath);

        if (!fs.existsSync(usersFilePath)) {
            console.warn('⚠️ users.json 파일이 존재하지 않습니다. 새로 생성합니다.');
            fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
        }

        const data = fs.readFileSync(usersFilePath, 'utf8');
        console.log('📄 users.json 내용:', data);

        return JSON.parse(data);
    } catch (error) {
        console.error('❌ users.json 파일 로드 중 오류 발생:', error);
        return [];
    }
};


// 데이터 저장 함수
const saveUsers = (users) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        console.log('✅ users.json 저장 완료');
    } catch (error) {
        console.error('❌ users.json 저장 중 오류 발생:', error);
    }
};

// 로그인 상태 확인
app.get('/api/auth/check', verifyToken, (req, res) => {
    res.json({ success: true, user: req.user });
});

// 로그인 API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const users = loadUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = jwt.sign({ email: user.email, nickname: user.nickname }, SECRET_KEY, { expiresIn: '1h' });

    res.cookie('token', token, {
        httpOnly: true,  // 자바스크립트로 쿠키에 접근할 수 없음
        secure: false,   // 개발 환경에서는 false
        maxAge: 3600000,  // 1시간
    });
    console.log("토큰 쿠키 설정:", token);
    res.json({ success: true, message: '로그인 성공' });
});





// 로그아웃 API
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: '로그아웃 성공' });
});

// 비밀번호 변경
app.put('/api/user/password', verifyToken, async (req, res) => {
    console.log('비밀번호 변경 요청 데이터:', req.body);

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });
    }

    const users = loadUsers();
    const user = users.find((u) => u.email === req.user.email); // JWT에서 사용자 정보 가져오기

    if (!user) {
        console.log('사용자를 찾을 수 없습니다:', req.user.email);
        return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    // 현재 비밀번호 확인
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        console.log('현재 비밀번호 불일치:', req.user.email);
        return res.status(401).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    // 새로운 비밀번호 암호화 후 저장
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    saveUsers(users);

    console.log('비밀번호 변경 성공:', req.user.email);
    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
});


// 프로필 수정
app.put('/api/user/profile', verifyToken, async (req, res) => {
    const { nickname } = req.body;
    const users = loadUsers();
    const user = users.find(u => u.email === req.user.email);

    if (!user) {
        return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    user.nickname = nickname;  // 닉네임 업데이트
    saveUsers(users);

    res.json({ success: true, user });
});

app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
