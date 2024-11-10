const jwtMiddleware = require("../../../config/jwtMiddleware");
const dealProvider = require("../../app/Deal/dealProvider");
const dealService = require("../../app/Deal/dealService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const axios = require('axios');

const jwt = require("jsonwebtoken");
const secret_config = require("../../../config/secret");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");

exports.postDeals = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const {sellerId, productId, dealType, payment, price, fees, shippingFee, receiveName,receiveHp,zipCode,address,detailAddress,comment} = req.body;

    if(!sellerId){
        return res.send(response(baseResponse.SELLER_ID_EMPTY));
    }
    if(!productId){
        return res.send(response(baseResponse.PRODUCT_ID_EMPTY));
    }
    if(!dealType){
        return res.send(response(baseResponse.DEAL_TYPE_EMPTY));
    }
    if(!payment){
        return res.send(response(baseResponse.PAYMENT_EMPTY));
    }
    if(!price){
        return res.send(response(baseResponse.PRICE_EMPTY));
    }
    if(fees == null || fees == undefined){
        return res.send(response(baseResponse.FEES_EMPTY));
    }
    if(!shippingFee){
        return res.send(response(baseResponse.SHIPPING_FEES_EMPTY));
    }

    if (dealType == 1){
        if (!receiveName || !receiveHp || !zipCode || !address || !detailAddress)
            return res.send(response(baseResponse.SHIPPING_ADDRESS_EMPTY));
    }
    const postDealsResponse = await dealService.createDeals(userId,sellerId,productId, dealType, payment, price, fees, 
        shippingFee, receiveName,receiveHp,zipCode,address,detailAddress,comment)
    return res.send(response(baseResponse.SUCCESS, postDealsResponse));
    
};

exports.getDeals = async function (req, res){
    const userId = req.verifiedToken.userId;
    const type = req.query.type;
    const status = req.query.status;

    console.log(type);
    if(type != 1 && type != 2){
        return res.send(response(baseResponse.TYPE_EMPTY));
    }

    if(status != 0 && status != 1 && status != 2 && status != 3){
        return res.send(response(baseResponse.STATUS_EMPTY));
    }
    
    const dealsResult = await dealProvider.findDeals(userId, type, status);
    return res.send(response(baseResponse.SUCCESS, dealsResult));

}

exports.getMyChatRooms = async function (req, res){
    const userId = req.verifiedToken.userId;
    const chatRoomResult = await dealProvider.findMyChatRooms(userId);
    return res.send(response(baseResponse.SUCCESS, chatRoomResult));

}

exports.postMyChatRooms = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const sellerId = req.body.sellerId;
    const productId = req.body.productId;
   
    const postChatRoomsResponse = await dealService.createChatRooms(userId, sellerId, productId)
    return res.send(response(baseResponse.SUCCESS, postChatRoomsResponse));
    
};

exports.postMessage = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const chatroomId = req.params.chatroomId;
    const message = req.body.message;
   
    const checkJoinIdResult = await dealProvider.checkJoinChatRoomId(chatroomId, userId);
    if(!checkJoinIdResult){
        return res.send(response(baseResponse.NOT_JOIN_CHATROOM));
    }

    const getChatRoomReceiveUserId = await dealProvider.findchatRoomUserId(chatroomId, userId, message);
    const receiveUserId = getChatRoomReceiveUserId.recevieUserId;
    const postChatResponse = await dealService.createMessage(chatroomId, userId, receiveUserId, message)
    return res.send(response(baseResponse.SUCCESS, postChatResponse));
    
};

exports.getChatId = async function (req, res){
    const userId = req.verifiedToken.userId;
    const chatroomId = req.params.chatroomId;
    const checkJoinIdResult = await dealProvider.checkJoinChatRoomId(chatroomId, userId);
    if(!checkJoinIdResult){
        return res.send(response(baseResponse.NOT_JOIN_CHATROOM));
    }
    const chatRoomIdResult = await dealProvider.findChatRoomId(chatroomId, userId);
    return res.send(response(baseResponse.SUCCESS, chatRoomIdResult));

}

exports.patchMyChatRoom = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const chatroomId = req.params.chatroomId;

    const checkMyChatRoomIdResult = await dealProvider.checkMyChatRoomId(chatroomId, userId);
    console.log(checkMyChatRoomIdResult);
    if(!checkMyChatRoomIdResult){
        return res.send(response(baseResponse.NOT_JOIN_CHATROOM));
    }
    const myChatId = checkMyChatRoomIdResult.myChatId;
   
    const deleteMyChatRoomResponse = await dealService.deleteMyChatRoom(myChatId,userId,chatroomId)
    return res.send(response(baseResponse.SUCCESS, deleteMyChatRoomResponse));
    
};