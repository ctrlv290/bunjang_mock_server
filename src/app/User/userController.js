const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const axios = require('axios');

const jwt = require("jsonwebtoken");
const secret_config = require("../../../config/secret");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");


//sns login
exports.snsLogin = async function (req, res) {
    const snsToken = req.body.accessToken;
    const snsType = req.body.snsType;
    var result;

    if (!snsToken) return res.send(errResponse(baseResponse.ACCESS_TOKEN_EMPTY));
    if (!snsType) return res.send(errResponse(baseResponse.SNS_TYPE_EMPTY));

    if(snsType == 'kakao'){
        result = await axios.get("https://kapi.kakao.com/v2/user/me",{
            headers: {
                    Authorization: `Bearer ${snsToken}`
            }
        })
    }
    else if(snsType == 'naver') {}
    else if(snsType == 'facebook') {}
    const snsId = result.data.id;
    const snsIdCheckResult = await userProvider.snsIdCheck(snsType,snsId);

    if(snsIdCheckResult.length > 0) { //로그인
        //토큰 생성
        let token = await jwt.sign(
            {
                userId: snsIdCheckResult[0].userId,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );
        const result= {
                    jwt:token,
                    userId:snsIdCheckResult[0].userId
                };
        return res.send(response(baseResponse.SUCCESS, result));
   } else{
    const insertUser = await userService.insertUser(snsType,snsId);
            let token = await jwt.sign({
                userId: insertUser.insertId,
            }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
        );
        const result= {
            jwt:token,
            userId:insertUser.insertId
        };
        return res.send(response(baseResponse.SUCCESS, result));

   }
}

/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};

exports.getMyShop = async function (req, res){

    const userId = req.verifiedToken.userId;
    const type = req.query.type;
    const orderby = req.query.orderby;

    const myShopResult = await userProvider.findMyshop(userId, type);
    if(myShopResult.length != 0){
        const myShopProducts = await userProvider.findMyshopProduct(userId, type, orderby);
        myShopResult[0].productList = myShopProducts
    }

    return res.send(response(baseResponse.SUCCESS, myShopResult));
}

exports.getUserInfo = async function (req, res){

    const userId = req.verifiedToken.userId;

    const userInfoResult = await userProvider.findUserInfo(userId);

    return res.send(response(baseResponse.SUCCESS, userInfoResult));
}

exports.getProfiles = async function (req, res){

    const userId = req.verifiedToken.userId;

    const profilesResult = await userProvider.findProfiles(userId);
    return res.send(response(baseResponse.SUCCESS, profilesResult));
}

exports.putProfiles = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const marketName = req.body.marketName;
    const marketImg = req.body.marketImg;
    const marketUrl = req.body.marketUrl;
    const contactStart = req.body.contactStart;
    const contactEnd = req.body.contactEnd;
    const marketIntro = req.body.marketIntro;
    const policy = req.body.policy;
    const notice = req.body.notice;
    const updateProfileParams = [marketName,marketImg,marketUrl,contactStart,contactEnd,marketIntro,policy,notice];
    
    if(marketIntro.length > 1000 || policy.length > 1000 || notice.length){
        return res.send(response(baseResponse.CONTENT_LENGTH_1000));
    }
    
    const putProfilesResponse = await userService.updateProfile(userId,updateProfileParams)

    return res.send(response(baseResponse.SUCCESS, putProfilesResponse));
    
};

exports.patchUserInfo = async function (req, res){

    const userId = req.verifiedToken.userId;
    const gender = req.body.gender;
    const birth = req.body.birth;
    const hp = req.body.hp;
    const openHp = req.body.openHp;
    const email = req.body.email;
    const status = req.body.status;

    function isEmail(asValue) {
        var regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
        return regExp.test(asValue); // 형식에 맞는 경우 true 리턴	
    }

    if (!gender && !birth && !hp && !openHp && !email && !status)
        return res.send(response(baseResponse.LENGTH_MINIMUM));
    if(!isEmail(email)){
        return res.send(response(baseResponse.EMAIL_WRONG));
    }
    if(isNaN(hp)){
        return res.send(response(baseResponse.ACCOUNT_IS_NOT_NUMBER));
    }

    const userInfoResult = await userService.patchUserInfo(userId,gender,birth,hp,openHp,email,status);
    return res.send(response(baseResponse.SUCCESS, userInfoResult));
}

exports.getAccounts = async function (req, res){

    const userId = req.verifiedToken.userId;
    const accountResult = await userProvider.findAccounts(userId);
    return res.send(response(baseResponse.SUCCESS, accountResult));
}

exports.postAccounts = async function (req, res){

    const userId = req.verifiedToken.userId;
    const bankName = req.body.bankName;
    const accountNum = req.body.accountNum;
    const accountHolder = req.body.accountHolder;


    if (!bankName)
        return res.send(response(baseResponse.BANK_NAME_EMPTY));
    if (!accountNum)
        return res.send(response(baseResponse.ACCOUNT_NUM_EMPTY));
    if (!accountHolder)
        return res.send(response(baseResponse.ACCOUNT_HOLDER_EMPTY));
    if(isNaN(accountNum)){
        return res.send(response(baseResponse.ACCOUNT_IS_NOT_NUMBER));
    }

    const accountResult = await userService.createAccount(userId,bankName,accountNum,accountHolder);
    return res.send(response(baseResponse.SUCCESS, accountResult));
}

exports.putAccount = async function (req, res){

    const accountId = req.params.accountId;
    const userId = req.verifiedToken.userId;
    const bankName = req.body.bankName;
    const accountNum = req.body.accountNum;
    const accountHolder = req.body.accountHolder;

    const accountUserId = await userProvider.findAccountUserId(userId, accountId);

    if(!accountUserId){
        return res.send(response(baseResponse.NOT_MY_INFO));
    }

    if (!bankName)
        return res.send(response(baseResponse.BANK_NAME_EMPTY));
    if (!accountNum)
        return res.send(response(baseResponse.ACCOUNT_NUM_EMPTY));
    if (!accountHolder)
        return res.send(response(baseResponse.ACCOUNT_HOLDER_EMPTY));
    if(isNaN(accountNum)){
        return res.send(response(baseResponse.ACCOUNT_IS_NOT_NUMBER));
    }

    const accountResult = await userService.updateAccount(accountId,userId,bankName,accountNum,accountHolder);
    return res.send(response(baseResponse.SUCCESS, accountResult));
}

exports.patchAccount = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const accountId = req.params.accountId;

    const accountUserId = await userProvider.findAccountUserId(userId, accountId);
    if(!accountUserId){
        return res.send(response(baseResponse.NOT_MY_INFO));
    }
    
    const patchAccountResponse = await userService.deleteAccount(accountId,userId)
    return res.send(response(baseResponse.SUCCESS, patchAccountResponse));
    
};

exports.getMyShippingAddress = async function (req, res){

    const userId = req.verifiedToken.userId;

    const myShippingAddressResult = await userProvider.findMyShippingAddress(userId);
    return res.send(response(baseResponse.SUCCESS, myShippingAddressResult));
}

exports.postMyShippingAddress = async function (req, res){

    const userId = req.verifiedToken.userId;
    const recipient = req.body.recipient;
    const hp = req.body.hp;
    const zipCode = req.body.zipCode;
    const address = req.body.address;
    const detailAddress = req.body.detailAddress;
    const isDefault = req.body.isDefault;
    const comment = req.body.comment;
    const insertAddressParams = [userId,recipient,hp,zipCode,address,detailAddress,comment,isDefault];
    if (!recipient || !hp || !zipCode || !address || !detailAddress)
        return res.send(response(baseResponse.SHIPPING_ADDRESS_EMPTY));



    const myShippingAddressResult = await userService.createAddress(insertAddressParams);
    return res.send(response(baseResponse.SUCCESS, myShippingAddressResult));
}

exports.putMyShippingAddress = async function (req, res){

    const userId = req.verifiedToken.userId;
    const addressId = req.params.addressId;
    const recipient = req.body.recipient;
    const hp = req.body.hp;
    const zipCode = req.body.zipCode;
    const address = req.body.address;
    const detailAddress = req.body.detailAddress;
    const isDefault = req.body.isDefault;
    const comment = req.body.comment;
    const updateAddressParams = [recipient,hp,zipCode,address,detailAddress,comment,isDefault];

    const addressUserId = await userProvider.findAddressUserId(userId,addressId);
    if(!addressUserId){
        return res.send(response(baseResponse.NOT_MY_INFO));
    }

    if (!recipient || !hp || !zipCode || !address || !detailAddress)
        return res.send(response(baseResponse.SHIPPING_ADDRESS_EMPTY));

    const myShippingAddressResult = await userService.updateAddress(updateAddressParams,addressId);
    return res.send(response(baseResponse.SUCCESS, myShippingAddressResult));
}

exports.getArea = async function (req, res){

    const userId = req.verifiedToken.userId;

    const areaResult = await userProvider.findArea(userId);
    return res.send(response(baseResponse.SUCCESS, areaResult));
    
}

exports.postArea = async function (req, res){

    const userId = req.verifiedToken.userId;
    const areaName = req.body.areaName;
    const areaRange = req.body.areaRange;
    const certification = req.body.certification;

    if (!areaName)
    return res.send(response(baseResponse.AREA_NAME_EMPTY));
    if (!areaRange)
        return res.send(response(baseResponse.AREA_RANGE_EMPTY));
    if (!certification)
        return res.send(response(baseResponse.AREA_CERTIFICATE_EMPTY));
    if(isNaN(areaRange)){
        return res.send(response(baseResponse.AREA_RANGE_ONLY_NUMBER));
}

    const areaResult = await userService.createArea(userId,areaName,areaRange,certification);
    return res.send(response(baseResponse.SUCCESS, areaResult));
    
}

exports.getReviews = async function (req, res){

    const sellerId = req.params.userId;

    const reviewsResult = await userProvider.findReviews(sellerId);
    return res.send(response(baseResponse.SUCCESS, reviewsResult));
    
}

exports.postReviews = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const sellerId = req.params.userId;
    const productId = req.body.productId;
    const grade = req.body.sellerId;
    const comment = req.body.comment;
    
    if (!sellerId)
        return res.send(response(baseResponse.SELLER_ID_EMPTY));
    if (!productId)
        return res.send(response(baseResponse.PRODUCT_ID_EMPTY));
    if (!grade)
        return res.send(response(baseResponse.GRADE_EMPTY));
    if (comment < 20)
        return res.send(response(baseResponse.CONTENT_LENGTH_MINIMUM_20));
    


    const postReviewsResponse = await userService.createReviews(userId,sellerId,productId,grade,comment)
    return res.send(response(baseResponse.SUCCESS, postReviewsResponse));
    
};

exports.patchReviews = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const reviewId = req.params.reviewId;

    
    const reviewUserId = await userProvider.findReviewUserId(userId, reviewId);
    if(!reviewUserId){
        return res.send(response(baseResponse.NOT_MY_INFO));
    }
    
    
    const patchReviewsResponse = await userService.deleteReviews(userId,reviewId)
    return res.send(response(baseResponse.SUCCESS, patchReviewsResponse));
    
};


exports.postFollowers = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const sellerId = req.body.sellerId;
    const notification = req.body.notification;
    
    if (!sellerId)
        return res.send(response(baseResponse.SELLER_ID_EMPTY));

    const postFollowersResponse = await userService.createFollower(userId,sellerId,notification)
    return res.send(response(baseResponse.SUCCESS, postFollowersResponse));
    
};

exports.getDibs = async function (req, res){

    const userId = req.verifiedToken.userId;
    const page = req.query.page;
    if(page){
        if(isNaN(page)){
            return res.send(response(baseResponse.PAGE_ONLY_NUMBER));
        }
    }
    const dibsResult = await userProvider.findDibs(userId, page);
    return res.send(response(baseResponse.SUCCESS, dibsResult));
}

exports.postDibs = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const productId = req.body.productId;
    
    if (!productId) 
        return res.send(response(baseResponse.PRODUCT_ID_EMPTY));

    const postDibsResponse = await userService.createDibs(userId,productId)
    return res.send(response(baseResponse.SUCCESS, postDibsResponse));
    
};

exports.getFollowers = async function (req, res){

    const userId = req.verifiedToken.userId;
    const page = req.query.page;
    if(page){
        if(isNaN(page)){
            return res.send(response(baseResponse.PAGE_ONLY_NUMBER));
        }
    }
    const followersResult = await userProvider.findFollowers(userId, page);
    return res.send(response(baseResponse.SUCCESS, followersResult));
}

exports.getFeeds = async function (req, res){

    const userId = req.verifiedToken.userId;
    const page = req.query.page;
    if(page){
        if(isNaN(page)){
            return res.send(response(baseResponse.PAGE_ONLY_NUMBER));
        }
    }
    const feedsResult = await userProvider.findFeeds(userId, page);
    return res.send(response(baseResponse.SUCCESS, feedsResult));
}

exports.getFollowing = async function (req, res){

    const userId = req.verifiedToken.userId;
    const page = req.query.page;
    if(page){
        if(isNaN(page)){
            return res.send(response(baseResponse.PAGE_ONLY_NUMBER));
        }
    }    
    const followingResult = await userProvider.findFollowing(userId, page);
    return res.send(response(baseResponse.SUCCESS, followingResult));
}

exports.getFollowRecommand = async function (req, res){

    const userId = req.verifiedToken.userId;
    const page = req.query.page;
    if(page){
        if(isNaN(page)){
            return res.send(response(baseResponse.PAGE_ONLY_NUMBER));
        }
    }    
    const followRecommandResult = await userProvider.findFollowRecommand(userId, page);
    return res.send(response(baseResponse.SUCCESS, followRecommandResult));
}

exports.patchMyShippingAddress = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const addressId = req.params.addressId;

    const addressUserId = await userProvider.findAddressUserId(userId,addressId);
    if(!addressUserId){
        return res.send(response(baseResponse.NOT_MY_INFO));
    }
    
    const patchAddressIdResponse = await userService.deleteAddress(addressId, userId)
    return res.send(response(baseResponse.SUCCESS, patchAddressIdResponse));
    
};
