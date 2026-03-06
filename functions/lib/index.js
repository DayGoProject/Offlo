"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeScreenTime = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const gemini_1 = require("./gemini");
admin.initializeApp();
exports.analyzeScreenTime = (0, https_1.onCall)({
    region: "us-central1", // Optional: specify region explicitly
    cors: true // Enable CORS for frontend requests
}, async (request) => {
    // 1. Check Authentication
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const filePath = request.data?.filePath; // e.g. "users/{uid}/analyses/filename.jpg"
    if (!filePath) {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with a valid 'filePath'.");
    }
    try {
        // 2. Download Image from Storage
        const bucket = admin.storage().bucket();
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        if (!exists) {
            throw new https_1.HttpsError("not-found", "Image file not found in storage.");
        }
        const [fileBuffer] = await file.download();
        const [metadata] = await file.getMetadata();
        const mimeType = metadata.contentType || "image/jpeg";
        // 3. Call Gemini AI to Analyze
        const analysisResult = await (0, gemini_1.analyzeImageWithGemini)(mimeType, fileBuffer);
        // 4. Save result to Firestore
        const db = admin.firestore();
        const docRef = await db.collection("users").doc(request.auth.uid).collection("analyses").add({
            filePath,
            result: analysisResult,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            // isPremium logic can be added here
        });
        // 5. Return result to frontend
        return {
            success: true,
            analysisId: docRef.id,
            data: analysisResult
        };
    }
    catch (error) {
        console.error("analyzeScreenTime failed:", error);
        throw new https_1.HttpsError("internal", error.message || "An unknown error occurred.");
    }
});
//# sourceMappingURL=index.js.map