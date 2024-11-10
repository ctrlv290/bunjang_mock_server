const jwtMiddleware = require("../../../config/jwtMiddleware");
const productProvider = require("../Product/productProvider");
const productService = require("../Product/productService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const {pool} = require("../../../config/database");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");

exports.getProducts = async function (req, res){

    const userId = req.verifiedToken.userId;
    const categoryG = req.query.categoryG;
    const categoryM = req.query.categoryM;
    const categoryS = req.query.categoryS;
    const orderby = req.query.orderby;
    const page = req.query.page;

    const productsResult = await productProvider.findProducts(userId,categoryG,categoryM,categoryS,orderby,page);
    return res.send(response(baseResponse.SUCCESS, productsResult));
}


exports.postProducts = async function (req, res) {
    const userId = req.verifiedToken.userId;

    const {
        productImg,
        productName, description, price, shippingFee, 
        negotiation, areaId, categoryGId, categoryMId,categorySId,tag
    } = req.body;

    if (!userId)
        return res.send(response(baseResponse.USER_ID_EMPTY));
    if (!productImg)
        return res.send(response(baseResponse.PRODUCT_IMG_LENGTH_MINIMUM));
    if (productImg.length < 1)
        return res.send(response(baseResponse.PRODUCT_IMG_LENGTH_MINIMUM));
    if (productImg.length > 12)
        return res.send(response(baseResponse.PRODUCT_IMG_LENGTH_MAXMUM));
    if (!productName)
        return res.send(response(baseResponse.PRODUCT_NAME_EMPTY));
    if (productName.length > 100)
        return res.send(response(baseResponse.PRODUCT_NAME_LENGTH));
    if (!categoryGId || !categoryMId || !categorySId)
        return res.send(response(baseResponse.CATEGORY_EMPTY));
    if (!price)
        return res.send(response(baseResponse.PRICE_EMPTY));
    if (description)
        if(description.length > 2000){
            return res.send(response(baseResponse.PRODUCT_DESCRIPTION_LENGTH));
        }
    if(negotiation == "N"){
        if (price < 100)
            return res.send(response(baseResponse.PRICE_MINIMUM));
    }
    const postProductResponse = await productService.createProduct(
        userId, productImg,
        productName, description, price, shippingFee, 
        negotiation, areaId, categoryGId,categoryMId,categorySId, tag);
    return res.send(response(baseResponse.SUCCESS, postProductResponse));
    
};

exports.putProductId = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const productId = req.params.productId;

    const checkMyproductId = await productProvider.checkProductUserId(productId);

    if(!checkMyproductId){
        return res.send(response(baseResponse.NOT_MY_PRODUCT));
    }
    if(checkMyproductId.userId != userId){
        return res.send(response(baseResponse.NOT_MY_PRODUCT));
    }

    const {
        productImg,
        productName, description, price, shippingFee, 
        negotiation, areaId, categoryGId, categoryMId,categorySId,tag
    } = req.body;

    if (!productImg)
        return res.send(response(baseResponse.PRODUCT_IMG_LENGTH_MINIMUM));
    if (productImg.length < 1)
        return res.send(response(baseResponse.PRODUCT_IMG_LENGTH_MINIMUM));
    if (productImg.length > 12)
        return res.send(response(baseResponse.PRODUCT_IMG_LENGTH_MAXMUM));
    if (!productName)
        return res.send(response(baseResponse.PRODUCT_NAME_EMPTY));
    if (productName.length > 100)
        return res.send(response(baseResponse.PRODUCT_NAME_LENGTH));
    if (!categoryGId || !categoryMId || !categorySId)
        return res.send(response(baseResponse.CATEGORY_EMPTY));
    if (!price)
        return res.send(response(baseResponse.PRICE_EMPTY));
    if (description)
        if(description.length > 2000){
            return res.send(response(baseResponse.PRODUCT_DESCRIPTION_LENGTH));
        }
    if(negotiation == "N"){
        if (price < 100)
            return res.send(response(baseResponse.PRICE_MINIMUM));
    }
    const putProductResponse = await productService.updateProduct(
        productId, productImg,
        productName, description, price, shippingFee, 
        negotiation, areaId, categoryGId,categoryMId,categorySId, tag);
    return res.send(response(baseResponse.SUCCESS, putProductResponse));
    
};

exports.patchProductId = async function (req, res){

    const userId = req.verifiedToken.userId;
    const productId = req.params.productId;
    const isDelete = req.body.isDelete;
    const salesStatus = req.body.salesStatus; 

    if(!checkMyproductId){
        return res.send(response(baseResponse.NOT_MY_PRODUCT));
    }
    if(checkMyproductId.userId != userId){
        return res.send(response(baseResponse.NOT_MY_PRODUCT));
    }

    const procutIdResult = await productService.patchProductId(userId, productId, isDelete, salesStatus);

    return res.send(response(baseResponse.SUCCESS, procutIdResult));
}

exports.postQuestions = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const productId =req.params.productId;
    const content = req.body.content;
    if (!content)
        return res.send(response(baseResponse.CONTENT_EMPTY));
    if (content.length > 100)
        return res.send(response(baseResponse.CONTENT_LENGTH_100));

    const postQuestionsResponse = await productService.createQuestion(userId,productId,content)
    return res.send(response(baseResponse.SUCCESS, postQuestionsResponse));
    
};

exports.getProductId = async function (req, res){

    const userId = req.verifiedToken.userId;
    const productId =req.params.productId;

    const productIdImgResult = await productProvider.findProductIdImg(productId);
    const productIdResult = await productProvider.findProductId(userId,productId);
    const productIdTag = await productProvider.findProductIdTag(productId);
    const sellerOtherProducts = await productProvider.findSellerOtherProducts(productId);
    const sellerReviewsPreviews = await productProvider.findSellerReviewsPreviews(productId);
    const postViewsAndLatley = await productService.createViewsAndLately(userId,productId);
    // const postViewsResponse = await productService.createViews(userId,productId);
    Object.assign(productIdResult, productIdImgResult, productIdTag, sellerOtherProducts, sellerReviewsPreviews);
    return res.send(response(baseResponse.SUCCESS,[productIdResult]));
}

exports.getDibsUsers = async function (req, res){

    const productId =req.params.productId;

    const dibsUsersResult = await productProvider.findDibsUsers(productId);

    return res.send(response(baseResponse.SUCCESS,dibsUsersResult));
}

exports.getCategoryG = async function (req, res){

    const categoryGResult = await productProvider.findCategoryG();
    return res.send(response(baseResponse.SUCCESS, categoryGResult));

}

exports.getCategoryM = async function (req, res){

    const categoryGId = req.params.categoryGId;

    const categoryMResult = await productProvider.findCategoryM(categoryGId);
    return res.send(response(baseResponse.SUCCESS, categoryMResult));
}

exports.getCategoryS = async function (req, res){

    const categoryMId = req.params.categoryMId;

    const categorySResult = await productProvider.findCategoryS(categoryMId);
    return res.send(response(baseResponse.SUCCESS, categorySResult));
}

exports.getQuestions = async function (req, res){

    const productId = req.params.productId;
    const questionResult = await productProvider.findQuestions(productId);
    return res.send(response(baseResponse.SUCCESS, questionResult));
}

exports.patchQuestions = async function (req, res){
    
    const questionId = req.params.questionId;
    const userId = req.verifiedToken.userId;
    

    const questionUserIdResult = await productProvider.findQuestionsUserId(userId,questionId);
    if(!questionUserIdResult){
        return res.send(response(baseResponse.NOT_MY_CONTENT));
    }

    const questionResult = await productService.deleteQuestions(questionId);
    return res.send(response(baseResponse.SUCCESS, questionResult));
}

exports.getLatelyProducts = async function (req, res){

    const userId = req.verifiedToken.userId;
    const page = req.query.page
    const latelyProductsResult = await productProvider.findLatelyProducts(userId,page);
    return res.send(response(baseResponse.SUCCESS, latelyProductsResult));
}

exports.patchLatelyProducts = async function (req, res){

    const userId = req.verifiedToken.userId;
    const latelyProcutIds = req.body.latelyProductIds

    if (!latelyProcutIds)
        return res.send(response(baseResponse.LENGTH_MINIMUM));

    if (latelyProcutIds.length < 1)
        return res.send(response(baseResponse.LENGTH_MINIMUM));

    const latelyProcutIdsResult = await productService.deleteLatelyProducts(latelyProcutIds,userId);
    return res.send(response(baseResponse.SUCCESS, latelyProcutIdsResult));
}