import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const app = express();
const PORT = 3001;

// CORS 설정
app.use(
    cors({
        origin: ['http://localhost:3001', 'http://127.0.0.1:5500'], // 허용 도메인
        credentials: true, // 쿠키 허용
    })
);

// 미들웨어 설정
app.use(bodyParser.json());

// 데이터 경로 설정
const dataDir = './data';
const usersFilePath = path.join(dataDir, 'users.json');
const upload = multer({ dest: '/data' });


// 데이터 로드 함수
const loadData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error loading data from ${filePath}:`, error);
        return [];
    }
};

// 데이터 저장 함수
const saveData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving data to ${filePath}:`, error);
    }
};

// 공통 응답 함수
const createResponse = (success, message, data = null) => ({ success, message, data });

// 사용자 데이터 로드 및 저장
const loadUsers = () => loadData(usersFilePath);
const saveUsers = (users) => saveData(usersFilePath, users);

// 회원가입
app.post('/api/signup', (req, res) => {
    const { email, password, nickname } = req.body;
    const users = loadUsers();

    if (users.some((user) => user.email === email)) {
        return res.status(409).json(createResponse(false, '이미 존재하는 이메일입니다.'));
    }

    const newUser = {
        id: Date.now(),
        email,
        password,
        nickname,
    };

    users.push(newUser);
    saveUsers(users);
    res.status(201).json(createResponse(true, '회원가입이 완료되었습니다.', { userId: newUser.id }));
});


// 로그인
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = loadUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json(createResponse(false, '잘못된 이메일 또는 비밀번호입니다.'));
    }

    res.json(createResponse(true, '로그인 성공', { email: user.email, nickname: user.nickname }));
});

// 비밀번호 변경
app.put('/api/user/password', (req, res) => {
    console.log('비밀번호 변경 요청 데이터:', req.body);

    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: '필수 정보가 누락되었습니다.' });
    }

    const users = loadData(usersFilePath);
    const user = users.find((u) => u.email === email);

    if (!user) {
        console.log('사용자를 찾을 수 없습니다:', email);
        return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    if (user.password !== currentPassword) {
        console.log('현재 비밀번호 불일치:', currentPassword);
        return res.status(401).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    user.password = newPassword;
    saveData(usersFilePath, users);
    console.log('비밀번호 변경 성공:', email);

    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
});




// 로그인 상태 확인
app.get('/api/auth/check', (req, res) => {
    const { email } = req.query;
    const users = loadUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(404).json(createResponse(false, '사용자를 찾을 수 없습니다.'));
    }

    res.status(200).json(createResponse(true, '로그인 상태 확인 성공', { email: user.email, nickname: user.nickname }));
});


// 프로필 업데이트 엔드포인트 수정
app.put('/api/user/profile', upload.single('profile'), (req, res) => {
    const email = req.body.email;
    const nickname = req.body.nickname;
    const profilePath = req.file ? req.file.path : null;

    const users = loadUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(404).json(createResponse(false, '사용자를 찾을 수 없습니다.'));
    }

    // 사용자 정보 업데이트
    if (nickname) user.nickname = nickname;
    if (profilePath) user.profile = profilePath; // 프로필 이미지 경로 저장

    saveUsers(users);
    res.json(createResponse(true, '회원정보가 성공적으로 수정되었습니다.', user));
});


// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
