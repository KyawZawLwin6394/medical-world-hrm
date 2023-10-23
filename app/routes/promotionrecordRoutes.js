const attendance = require("../controllers/promotionrecordController");
const { catchError } = require("../lib/errorHandler");
const { upload } = require("../lib/fieldUploader");
const verifyToken = require("../lib/verifyToken")

module.exports = app => {
    app
    .route("/api/promote")
    .get(verifyToken,catchError(attendance.listAllPromotionRecord))
    .post( verifyToken, upload, catchError(attendance.createPromotionRecord))

    app
    .route("/api/promote/:id")
    .get(verifyToken, catchError(attendance.getPromotionDetail))
    .put(verifyToken,catchError(attendance.updatePromotionRecord))
    .delete(verifyToken, catchError(attendance.deletePromotionRecord) )
}