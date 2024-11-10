const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const dealService = require("../../app/Deal/dealService");

const dealDao = require("./dealDao");

exports.findDeals = async function (userId, type, status) {

    const connection = await pool.getConnection(async (conn) => conn);
    const dealsResult = await dealDao.selectDeals(connection, userId, type, status);
    connection.release();

    return dealsResult;

};

exports.chatRoomCheck = async function (userId, sellerId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const chatRoomCheckResult = await dealDao.findChatRoomId(connection, userId, sellerId);
    connection.release();
    return chatRoomCheckResult[0];

};

exports.myChatRoomCheck = async function (chatroomId,userId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const myChatRoomCheckResult = await dealDao.findMyChatRoomId(connection, chatroomId, userId);
    connection.release();

    return myChatRoomCheckResult[0];

};

exports.findMyChatRooms = async function (userId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const myChatRoomsResult = await dealDao.selectMyChatRooms(connection, userId);
    connection.release();

    return myChatRoomsResult;

};

exports.findChatRoomId = async function (chatroomId, userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction(); 

        const messageRead = await dealDao.updateMessageToRead(connection, chatroomId, userId);
        const chatroomIdResult = await dealDao.selectChatRoomIdInfo(connection, chatroomId, userId);
        const messageResult = await dealDao.selectChatRoomIdMessage(connection, chatroomId, userId);
        chatroomIdResult[0].messageList = messageResult;

        connection.release();
        await connection.commit()
        return chatroomIdResult;
    } catch (err) {
        logger.error(`App - findChatRoomId error\n: ${err.message}`);
        await connection.rollback(); //롤백
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release(); // conn 회수
    }
};


exports.checkJoinChatRoomId = async function (chatroomId, userId) {

        const connection = await pool.getConnection(async (conn) => conn);
        const checkJoinChatRoomIdResult = await dealDao.checkJoinChatRoomId(connection, chatroomId, userId);
        connection.release();
    
        return checkJoinChatRoomIdResult[0];
    
};

exports.findchatRoomUserId = async function (chatroomId, userId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const findchatRoomUserIdResult = await dealDao.selectChatRoomUserId(connection, chatroomId, userId);
    connection.release();

    return findchatRoomUserIdResult[0];

};

exports.checkMyChatRoomId = async function (chatroomId, userId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const checkMyChatRoomIdResult = await dealDao.findMyChatRoomId(connection, chatroomId, userId);
    connection.release();

    return checkMyChatRoomIdResult[0];

};


