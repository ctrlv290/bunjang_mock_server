const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const productDao = require("./productDao");

exports.findProducts = async function (userId,categoryG,categoryM,categoryS,orderby,page) {

    const connection = await pool.getConnection(async (conn) => conn);
    const productsResult = await productDao.selectProducts(connection,userId,categoryG,categoryM,categoryS,orderby,page);
    connection.release();

    return productsResult;

};

exports.findProductId = async function (userId,productId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const productIdResult = await productDao.selectProductId(connection,userId,productId);
    connection.release();

    return productIdResult;

};

exports.findDibsUsers = async function (productId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const dibsProductResult = await productDao.selectDibsProduct(connection,productId);
    const dibsUsersResult = await productDao.selectDibsUsers(connection,productId);
    dibsProductResult[0].dibsUsers = dibsUsersResult;

    connection.release();

    return dibsProductResult;

};

exports.findProductIdImg = async function (productId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const productIdImgResult = await productDao.selectProductIdImg(connection,productId);
    connection.release();

    return productIdImgResult;

};

exports.findProductIdTag = async function (productId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const productIdTagResult = await productDao.selectProductIdTag(connection,productId);
    connection.release();

    return productIdTagResult;

};

exports.findSellerOtherProducts = async function (productId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const sellerSellerOtherProductsResult = await productDao.selectSellerOtherProducts(connection,productId);
    connection.release();

    return sellerSellerOtherProductsResult;

};

exports.findSellerReviewsPreviews = async function (productId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const sellerSellerReviewsPreviewsResult = await productDao.selectSellerReviewsPreviews(connection,productId);
    connection.release();

    return sellerSellerReviewsPreviewsResult;

};

exports.findCategoryG = async function () {

    const connection = await pool.getConnection(async (conn) => conn);
    const categoryGResult = await productDao.selectCategoryG(connection);
    connection.release();

    return categoryGResult;

};

exports.findCategoryM = async function (categoryGId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const categoryMResult = await productDao.selectCategoryM(connection, categoryGId);
    connection.release();

    return categoryMResult;

};

exports.findCategoryS = async function (categoryMId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const categorySResult = await productDao.selectCategoryS(connection, categoryMId);
    connection.release();

    return categorySResult;

};

exports.findQuestions = async function (productId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const questionResult = await productDao.selectQuestions(connection, productId);
    connection.release();

    return questionResult;

};

exports.findLatelyProducts = async function (userId,page) {

    const connection = await pool.getConnection(async (conn) => conn);
    const LatelyProductsResult = await productDao.selectLatelyProducts(connection, userId,page);
    connection.release();

    return LatelyProductsResult;

};

exports.checkProductUserId = async function (productId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const userIdResult = await productDao.selectProductUserId(connection,productId);
    connection.release();

    return userIdResult[0];

};

exports.findQuestionsUserId = async function (userId, questionId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const userIdResult = await productDao.selectQuestionsUserId(connection,userId,questionId);
    connection.release();

    return userIdResult[0];

};