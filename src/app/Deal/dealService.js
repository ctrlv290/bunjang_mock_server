const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const dealProvider = require("./dealProvider");
const dealDao = require("./dealDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

exports.createDeals = async function (userId, sellerId, productId, dealType, payment, price, fees, shippingFee, 
    receiveName,receiveHp,zipCode,address,detailAddress,comment) {
    const connection = await pool.getConnection(async (conn) => conn);

    var messageType = 0;
    var status = 0;
    var message = '';

    if(!productId)
        productId = 0;

    if (!fees)
        fees = 0;

    if(dealType == 1 || dealType == 2){
        messageType = 2;
        status = 1;
        message = '결제가 완료되었습니다.'
    }

    if(dealType == 3 || dealType == 4){
        messageType = 1;
        status = 0;
        message = '거래를 승인해주세요.'
    }
    

    try {
        await connection.beginTransaction(); 

        const insertDealParams = [userId, sellerId, productId, dealType, payment, price, fees, shippingFee, status];
        const createDealResult = await dealDao.insertDeal(connection, insertDealParams);
        const dealId = createDealResult[0].insertId;

        if(dealType == 1){
            const insertAddressParams = [dealId,receiveName,receiveHp,zipCode,address,detailAddress,comment];
            const createShippingAddress = await dealDao.insertShippingAddress(connection,insertAddressParams);
        }
        const chatRoom = await dealProvider.chatRoomCheck(userId,sellerId);
        console.log(chatRoom)
        const chatRoomCheck = await dealProvider.chatRoomCheck(userId, sellerId);
		if (!chatRoomCheck) {
            const createChatRoom = await dealDao.insertChatRoom(connection, userId, sellerId, productId, dealId);
            var chatroomId = createChatRoom[0].insertId
        }else{
            var chatroomId = chatRoomCheck.chatroomId;
            const updateChatRoom = await dealDao.updateChatRoomChangeDealId(connection, chatroomId, dealId);
        }

        const myChatRoomCheck = await dealProvider.myChatRoomCheck(chatroomId, userId);
        if (!myChatRoomCheck) {
            const createMyChatRoom = await dealDao.insertMyChatRoom(connection, chatroomId, userId);
        }

        const yourChatRoomCheck = await dealProvider.myChatRoomCheck(chatroomId, sellerId);
        if (!yourChatRoomCheck) {
            const createYourChatRoom = await dealDao.insertMyChatRoom(connection, chatroomId, sellerId);
        }

        const createMessage = await dealDao.insertMessage(connection, chatroomId, userId, sellerId, message, messageType, dealId);
        
        await connection.commit() // 커밋
        return {dealId:createDealResult[0].insertId};


    } catch (err) {
        logger.error(`App - createDeal Service error\n: ${err.message}`);
        await connection.rollback(); //롤백
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release(); // conn 회수
    }
};

exports.createChatRooms = async function (userId, sellerId, productId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction(); 


        const chatRoomCheck = await dealProvider.chatRoomCheck(userId, sellerId);
		if (!chatRoomCheck) {
           const createChatRoom = await dealDao.insertChatRoom(connection, userId, sellerId, productId, 0);
                console.log(`추가된 채팅룸 id: ${createChatRoom[0].insertId}`);
            var chatroomId = createChatRoom[0].insertId
        }else{
            var chatroomId = chatRoomCheck.chatroomId;
            const updateUserChange = await dealDao.updateChatRoomChangeUserId(connection, chatroomId, userId, sellerId, productId);
            console.log(`변경된 채팅룸 id: ${updateUserChange[0].changedRows}`);
        }

        const myChatRoomCheck = await dealProvider.myChatRoomCheck(chatroomId, userId);
        if (!myChatRoomCheck) {
           const createMyChatRoom = await dealDao.insertMyChatRoom(connection, chatroomId, userId);
                console.log(`추가된 내 채팅룸 id: ${createMyChatRoom[0].insertId}`);
        }

        const yourChatRoomCheck = await dealProvider.myChatRoomCheck(chatroomId, sellerId);
        if (!yourChatRoomCheck) {
           const createYourChatRoom = await dealDao.insertMyChatRoom(connection, chatroomId, sellerId);
                console.log(`추가된 상대방 채팅룸 id: ${createYourChatRoom[0].insertId}`);
        }
        
        await connection.commit() // 커밋
        return {chatroomId:chatroomId};


    } catch (err) {
        logger.error(`App - createDeal Service error\n: ${err.message}`);
        await connection.rollback(); //롤백
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release(); // conn 회수
    }
};

exports.createMessage = async function (chatroomId, userId, receiveUserId, message) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const insertMsg = await dealDao.insertMessage(connection,chatroomId, userId, receiveUserId, message);
        console.log(`message Id: ${insertMsg[0].insertId}`);
        
        return {messageId:insertMsg[0].insertId};
    } catch (err) {
        logger.error(`App - createMessage error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.deleteMyChatRoom = async function (myChatId, userId,chatroomId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const deleteMyroom = await dealDao.deleteMyChatRoom(connection,myChatId, userId);
        console.log(`deletedRows: ${deleteMyroom[0]}`);
        
        return {deletedId:chatroomId};
    } catch (err) {
        logger.error(`App - createMessage error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};