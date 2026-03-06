import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

// 이메일 로그인
export const loginWithEmail = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    // 테스트용 계정 예외 처리
    if (!credential.user.emailVerified && credential.user.email !== 'test1@test.com') {
        await signOut(auth);
        throw new Error('이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.');
    }
    return credential;
};

// 이메일 회원가입
export const signupWithEmail = async (email: string, password: string, name: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // 이메일 인증 메일 발송
    await sendEmailVerification(user);

    await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        premium: false,
        createdAt: serverTimestamp(),
    });

    // 인증 전까지는 강제 로그아웃
    await signOut(auth);
    return credential;
};

// Google 소셜 로그인
export const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
        userRef,
        { name: user.displayName, email: user.email, premium: false, createdAt: serverTimestamp() },
        { merge: true }
    );
    return credential;
};

// 로그아웃
export const logout = () => signOut(auth);

// 인증 상태 구독
export const subscribeToAuthState = (callback: (user: User | null) => void) =>
    onAuthStateChanged(auth, callback);
