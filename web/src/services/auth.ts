import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const googleProvider = new GoogleAuthProvider();

// 이메일 로그인
export const loginWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

// 이메일 회원가입
export const signupWithEmail = async (email: string, password: string, name: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        premium: false,
        createdAt: serverTimestamp(),
    });
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
