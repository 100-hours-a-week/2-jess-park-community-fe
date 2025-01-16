import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import bcrypt from 'bcrypt';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        // uploads 폴더가 없으면 생성
        if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// CORS 옵션 설정
const corsOptions = {
    origin: ['http://localhost:3002', 'http://127.0.0.1:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'session', 
        'userId',
        'Origin',
        'Accept'
    ]
};

// CORS 미들웨어 적용
app.use(cors(corsOptions));
app.use(express.json());

// 모든 OPTIONS 요청에 대한 응답 처리
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 
        'Content-Type,Authorization,session,userId,Origin,Accept');
    res.status(200).send();
});

// 인증 체크 API
app.get('/api/auth', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    }
    res.json({ success: true });
});

// users.json 읽기 함수
async function readUsers() {
    try {
        const usersPath = path.join(__dirname, 'data', 'users.json');
        
        // data 디렉토리가 없으면 생성
        const dataDir = path.join(__dirname, 'data');
        if (!existsSync(dataDir)) {
            mkdirSync(dataDir, { recursive: true });
        }

        // users.json 파일이 없으면 생성
        if (!existsSync(usersPath)) {
            await fs.writeFile(usersPath, JSON.stringify({ users: [] }, null, 2));
            return { users: [] };
        }

        const data = await fs.readFile(usersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        // 기본값 반환
        return { users: [] };
    }
}

// users.json 쓰기 함수
async function writeUsers(data) {
    try {
        const usersPath = path.join(__dirname, 'data', 'users.json');
        // data가 배열인 경우 객체로 변환
        const usersData = Array.isArray(data) ? { users: data } : data;
        await fs.writeFile(usersPath, JSON.stringify(usersData, null, 2));
    } catch (error) {
        console.error('Error writing users:', error);
        throw new Error('Failed to write users data');
    }
}

// 로그인 API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 입력값 로깅
        console.log('Login attempt:', { 
            email,
            hasPassword: !!password,
            requestBody: req.body 
        });

        const { users } = await readUsers();
        console.log('Available users:', users.map(u => ({ 
            id: u.id, 
            userName: u.userName 
        })));

        // 사용자 찾기
        const user = users.find(u => u.id === email);
        console.log('User found:', user ? {
            id: user.id,
            userName: user.userName,
            hasPassword: !!user.password
        } : 'No user found');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 비밀번호 확인
        const isValid = await bcrypt.compare(password, user.password);
        console.log('Password validation:', {
            isValid,
            inputEmail: email,
            hashedPassword: user.password?.substring(0, 10) + '...',
            passwordLength: password?.length
        });

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // UUID를 사용한 세션 ID 생성
        const sessionId = uuidv4();

        res.json({
            success: true,
            data: {
                sessionId,
                userId: user.userId,
                userName: user.userName,
                profileImagePath: user.profileImagePath || null
            }
        });

    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 회원가입 API
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const { users } = await readUsers();

        // 이메일 중복 체크
        if (users.find(u => u.id === email)) {
            return res.status(400).json({
                success: false,
                message: '이미 사용 중인 이메일입니다.'
            });
        }

        // UUID를 사용한 userId 생성
        const userId = uuidv4();

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새 사용자 추가
        const newUser = {
            id: email,
            userId,
            userName: name,
            password: hashedPassword,
            profileImagePath: null
        };

        // 기존 사용자 배열에 새 사용자 추가
        const updatedUsers = [...users, newUser];
        
        // users 객체 형태로 저장
        await writeUsers({ users: updatedUsers });

        res.json({
            success: true,
            message: '회원가입이 완료되었습니다.'
        });

    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 닉네임 중복 체크 API
app.post('/api/check-nickname', async (req, res) => {
    try {
        const { nickname, userId } = req.body;
        const { users } = await readUsers();

        // 자신의 현재 닉네임인 경우는 통과
        const currentUser = users.find(u => u.userId === userId);
        if (currentUser && currentUser.userName === nickname) {
            return res.json({ 
                success: true,
                message: '사용 가능한 닉네임입니다.' 
            });
        }

        // 다른 사용자의 닉네임과 중복 체크
        const isDuplicate = users.some(user => 
            user.userId !== userId && user.userName === nickname
        );

        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                message: '이미 사용 중인 닉네임입니다.'
            });
        }

        res.json({
            success: true,
            message: '사용 가능한 닉네임입니다.'
        });

    } catch (error) {
        console.error('닉네임 중복 체크 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 이메일 중복 체크 API
app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const { users } = await readUsers();

        const exists = users.find(u => u.id === email);
        res.json({
            success: true,
            exists: !!exists
        });
    } catch (error) {
        console.error('이메일 체크 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 파일 업로드 API
app.post('/api/upload', upload.single('profileImage'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '파일이 없습니다.'
            });
        }

        res.json({
            success: true,
            data: {
                filePath: '/uploads/' + req.file.filename  // 경로 수정
            }
        });
    } catch (error) {
        console.error('파일 업로드 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 업로드된 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 사용자 정보 수정 API
app.put('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { nickname, profileImagePath } = req.body;
        const { users } = await readUsers();

        // 사용자 찾기
        const userIndex = users.findIndex(u => u.userId === userId);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        // 닉네임 중복 체크
        if (nickname && users.some(u => u.userName === nickname && u.userId !== userId)) {
            return res.status(400).json({
                success: false,
                message: '이미 사용 중인 닉네임입니다.'
            });
        }

        // 사용자 정보 업데이트
        users[userIndex] = {
            ...users[userIndex],
            userName: nickname || users[userIndex].userName,
            profileImagePath: profileImagePath || users[userIndex].profileImagePath
        };

        await writeUsers(users);

        res.json({
            success: true,
            message: '사용자 정보가 수정되었습니다.'
        });

    } catch (error) {
        console.error('사용자 정보 수정 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 회원 탈퇴 API
app.delete('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { users } = await readUsers();

        const userIndex = users.findIndex(u => u.userId === userId);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        // 사용자 삭제
        users.splice(userIndex, 1);
        await writeUsers(users);

        res.json({
            success: true,
            message: '회원 탈퇴가 완료되었습니다.'
        });

    } catch (error) {
        console.error('회원 탈퇴 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 비밀번호 변경 API
app.put('/api/users/:userId/password', async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        // 디버깅을 위한 로그
        console.log('Password change request:', {
            userId,
            hasCurrentPassword: !!currentPassword,
            hasNewPassword: !!newPassword
        });

        // users 객체 구조 수정
        let { users } = await readUsers();

        // 사용자 찾기
        const userIndex = users.findIndex(u => u.userId === userId);
        if (userIndex === -1) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        // 현재 비밀번호 확인
        const isValidPassword = await bcrypt.compare(currentPassword, users[userIndex].password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: '현재 비밀번호가 일치하지 않습니다.'
            });
        }

        // 새 비밀번호 해시화
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 비밀번호 업데이트
        users[userIndex].password = hashedNewPassword;
        
        // 올바른 형식으로 데이터 저장
        await writeUsers({ users });

        res.json({
            success: true,
            message: '비밀번호가 성공적으로 변경되었습니다.'
        });

    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`인증 서버가 http://localhost:${PORT}에서 실행 중입니다`);
});