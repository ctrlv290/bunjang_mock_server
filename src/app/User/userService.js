const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.insertUser = async function (snsType,snsId) {
    try {
        var snsIdcol;
        if(snsType == 'kakao'){
        snsIdcol = 'kakaoId'
        }
        else if(snsType == 'naver') {
        snsIdcol = 'naverId'
        }
        else if(snsType == 'facebook') {
        snsIdcol = 'facebookId'
        }

        const marketName = '상점' + Math.random() * 9999999999 + '호';

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUser(connection, snsIdcol, snsId, marketName);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.release();
        return response(baseResponse.SUCCESS,userIdResult[0].insertId);


    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createFollower = async function (userId, sellerId, notification) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const followerCheck = await userDao.findFollowId(connection, userId, sellerId);
        if(!notification){
            notification = 'N';
        }
        var status = 'Y';
        var followId = null;
        if(followerCheck[0]){
            followId =followerCheck[0].followId;
            status = followerCheck[0].status;
            if(status == 'Y'){
                status = 'N'
            }else{
                status = 'Y'
            }
        }
        const followerResult = await userDao.insertFollowers(connection, followId, userId, sellerId, status, notification);

        console.log(`Follower: ${followerResult[0].insertId}`)
        connection.release();
        return {followId:followerResult[0].insertId};
    } catch (err) {
        logger.error(`App - Follower Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createDibs = async function (userId, productId) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const dibsCheck = await userDao.findDibsId(connection, userId, productId);
        var status = 'Y';
        var dibsId = null;
        if(dibsCheck[0]){
            dibsId = dibsCheck[0].dibsId;
            status = dibsCheck[0].status;
            if(status == 'Y'){
                status = 'N'
            }else{
                status = 'Y'
            }
        }
        const dibsResult = await userDao.insertDibs(connection, dibsId, userId, productId, status);

        connection.release();
        return {dibsId:dibsResult[0].insertId};
    } catch (err) {
        logger.error(`App - createDibs Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createReviews = async function (userId,sellerId,productId, grade, comment) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const reviewResult = await userDao.insertReview(connection, userId,sellerId,productId, grade, comment);

        connection.release();
        return {reviewId:reviewResult[0].insertId};
    } catch (err) {
        logger.error(`App - createReviews Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.deleteReviews = async function (userId,reviewId) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const reviewResult = await userDao.deleteReview(connection, userId,reviewId);

        connection.release();
        return {deleteRows:reviewResult[0].changedRows};
    } catch (err) {
        logger.error(`App - createReviews Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createAccount = async function (userId,bankName,accountNum,accountHolder) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const accountResult = await userDao.insertAccount(connection, userId,bankName,accountNum,accountHolder);

        connection.release();
        return {accoundId:accountResult[0].insertId};
    } catch (err) {
        logger.error(`App - createAccount Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateAccount = async function (accountId,userId,bankName,accountNum,accountHolder) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const accountResult = await userDao.updateAccount(connection, accountId,userId,bankName,accountNum,accountHolder);

        connection.release();
        return {updateAccountId:accountId};
    } catch (err) {
        logger.error(`App - updateAccount Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.deleteAccount = async function (accountId,userId) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const accountResult = await userDao.deleteAccount(connection, accountId,userId);
        connection.release();
        return {deleteRows:accountResult[0].changedRows};
    } catch (err) {
        logger.error(`App - deleteAccount Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createArea = async function (userId,areaName,areaRange,certification) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const areaResult = await userDao.insertArea(connection, userId,areaName,areaRange,certification);

        connection.release();
        return {areaId:areaResult[0].insertId};
    } catch (err) {
        logger.error(`App - createArea Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
exports.createAddress = async function (insertAddressParams) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const areaResult = await userDao.insertAddress(connection, insertAddressParams);

        connection.release();
        return {addressId:areaResult[0].insertId};
    } catch (err) {
        logger.error(`App - createAddress Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateAddress = async function (updateAddressParams,addressId) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const addressResult = await userDao.updateAddress(connection, updateAddressParams,addressId);

        connection.release();
        return {updateId:addressId};
    } catch (err) {
        logger.error(`App - updateAddress Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.deleteAddress = async function (addressId,userId) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const addressResult = await userDao.deleteAddress(connection, addressId, userId);
        connection.release();
        return {deleteAddressId:addressId};
    } catch (err) {
        logger.error(`App - deleteAccount Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.patchUserInfo = async function (userId, gender, birth, hp, openHp, email, status) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const profilesResult = await userDao.patchProfiles(connection, userId,gender,birth,hp,openHp,email,status);
        connection.release();
        return {updateUserId:userId};
    } catch (err) {
        logger.error(`App - patchUserInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updateProfile = async function (userId,updateProfileParams) {
    
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const profileResult = await userDao.updateProfiles(connection,userId,updateProfileParams);

        connection.release();
        return {updateUserId:userId};
    } catch (err) {
        logger.error(`App - updateProfile Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};