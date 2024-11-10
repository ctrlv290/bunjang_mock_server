const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const productProvider = require("./productProvider");
const productDao = require("./productDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

exports.createProduct = async function (userId, productImg,
    productName, description, price, shippingFee, 
    negotiation, areaId, categoryGId,categoryMId,categorySId,tag) {
    const connection = await pool.getConnection(async (conn) => conn);
    if (!areaId)
        areaId = 0;
    if (negotiation == 'Y')
        price = 0;

    try {
        await connection.beginTransaction(); 

        const insertProductParams = [userId,
        productName, description, price, shippingFee, 
        negotiation, areaId, categoryGId,categoryMId,categorySId];

        const createProductResult = await productDao.insertProduct(connection, insertProductParams);
        const productId = createProductResult[0].insertId;
        console.log(`추가된 상품 : ${createProductResult[0].insertId}`)

        for(i=0; productImg.length > i; i++){
            const createProductImg = await productDao.insertProductImg(
                connection,
                productId,
                productImg[i],
                i+1
            );
            console.log(`추가된 사진 : ${createProductImg[0].insertId}`);
        }
        
        if(tag)
            for(i=0; tag.length > i; i++){
                const createTag = await productDao.insertProductTag(
                    connection,
                    productId,
                    tag[i],
                    i+1
                );
                console.log(`추가된 태그 : ${createTag[0].insertId}`);
            }

        await connection.commit() // 커밋
        return {productId:createProductResult[0].insertId};


    } catch (err) {
        logger.error(`App - createProduct Service error\n: ${err.message}`);
        await connection.rollback(); //롤백
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release(); // conn 회수
    }
};

exports.updateProduct = async function (productId, productImg,
    productName, description, price, shippingFee, 
    negotiation, areaId, categoryGId,categoryMId,categorySId,tag) {
    const connection = await pool.getConnection(async (conn) => conn);
    if (!areaId)
        areaId = 0;
    if (negotiation == 'Y')
        price = 0;

    try {
        await connection.beginTransaction(); 

        const updateProductParams = [
        productName, description, price, shippingFee, 
        negotiation, areaId, categoryGId,categoryMId,categorySId];

        const updateProductResult = await productDao.updateProduct(connection, productId, updateProductParams);
        const checkProductImg = await productDao.findBeforeProductImgCnt(connection,productId)
        const checkProductImgId = await productDao.findBeforeProductImgId(connection,productId)
        var beforeImgCnt = checkProductImg[0].beforeCNT
        var imgNumCnt = 0;
        if(beforeImgCnt <= productImg.length){
            for(i=0; beforeImgCnt > i; i++){
                var imageId= checkProductImgId[i].imageId;
                const updateProductImg = await productDao.updateProductImg(
                    connection,
                    imageId,
                    productImg[i],
                    i+1
                );
                imgNumCnt = imgNumCnt + 1
            }
            for(imgNumCnt; productImg.length > imgNumCnt; imgNumCnt++){
                const createProductImg = await productDao.insertProductImg(
                    connection,
                    productId,
                    productImg[imgNumCnt],
                    imgNumCnt+1
                );
            }
        }else{
            for(i=0; productImg.length > i; i++){
                var imageId= checkProductImgId[i].imageId;
                const updateProductImg = await productDao.updateProductImg(
                    connection,
                    imageId,
                    productImg[i],
                    i+1
                );
                imgNumCnt = imgNumCnt + 1
            }
            for(imgNumCnt; checkProductImgId.length > imgNumCnt; imgNumCnt++){
                var imageId= checkProductImgId[imgNumCnt].imageId;
                const deleteProductImg = await productDao.deleteProductImg(
                    connection,
                    imageId,
                    imgNumCnt+1
                );
            }
        }

        const checkProductTag = await productDao.findBeforeProductTagCnt(connection,productId)
        const checkProductTagId = await productDao.findBeforeProductTagId(connection,productId)
        var beforeTagCnt = checkProductTag[0].beforeCNT
        
        if(tag){
            if (tag.length > 0){
                var tagNumCnt = 0;
                if(beforeTagCnt > 0){
                    if(beforeTagCnt <= tag.length){
                        for(i=0; beforeTagCnt > i; i++){
                            var tagId= checkProductTagId[i].tagId;
                            const updateProductTag = await productDao.updateProductTag(
                                connection,
                                tagId,
                                tag[i],
                                i+1
                            );
                            tagNumCnt = tagNumCnt + 1
                        }
                        for(tagNumCnt; tag.length > tagNumCnt; tagNumCnt++){
                            const createProductTag = await productDao.insertProductTag(
                                connection,
                                productId,
                                tag[tagNumCnt],
                                tagNumCnt+1
                            );
                        }
                    }else{
                        for(i=0; tag.length > i; i++){
                            var tagId = checkProductTagId[i].tagId;
                            const updateProductTag = await productDao.updateProductTag(
                                connection,
                                tagId,
                                tag[i],
                                i+1
                            );
                            tagNumCnt = tagNumCnt + 1
                        }
                        for(tagNumCnt; checkProductTagId.length > tagNumCnt; tagNumCnt++){
                            var tagId= checkProductTagId[tagNumCnt].tagId;
                            const deleteProductImg = await productDao.deleteProductTag(
                                connection,
                                tagId,
                                tagNumCnt+1
                            );
                        }
                    }
                }else{
                    for(i=0; tag.length > i; i++){
                        const createTag = await productDao.insertProductTag(
                            connection,
                            productId,
                            tag[i],
                            i+1
                        );
                    }
                }  
            }     
        }

        await connection.commit() // 커밋
        return {updateProductId:productId};
    } catch (err) {
        logger.error(`App - updateProduct Service error\n: ${err.message}`);
        await connection.rollback(); //롤백
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release(); // conn 회수
    }
};

exports.patchProductId = async function (userId, productId, isDelete, salesStatus) {
    try {
        
        const connection = await pool.getConnection(async (conn) => conn);
        const deleteProductId = await productDao.patchProductId(connection,userId,productId,isDelete,salesStatus);
        console.log(`변경된 상품 수: ${deleteProductId[0].changedRows}`);
        deleteResult = deleteProductId[0].changedRows;
        
        return {patchProduct:deleteResult};
    } catch (err) {
        logger.error(`App - product Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createQuestion = async function (userId, productId, content) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);

        const questionResult = await productDao.insertQuestion(connection, userId, productId, content);
        console.log(`문의글 등록 : ${questionResult[0].insertId}`)
        connection.release();
        return {questionId:questionResult[0].insertId};


    } catch (err) {
        logger.error(`App - createQuestion Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.deleteQuestions = async function (questionId) {
    try {

        const connection = await pool.getConnection(async (conn) => conn);

        const questionResult = await productDao.deleteQuestion(connection, questionId);
        console.log(`문의글 삭제 : ${questionResult[0].insertId}`)
        connection.release();
        return {deleteQuestionId:questionId};


    } catch (err) {
        logger.error(`App - deleteQuestion Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.createViewsAndLately = async function (userId, productId) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {

        await connection.beginTransaction(); 
       
        const viewsResult = await productDao.insertViews(connection, userId,productId);
        console.log(`조회수 추가 : ${viewsResult[0].insertId}`)
        const latelyResult = await productDao.insertLately(connection, userId,productId);
        console.log(`최근 본 상품 추가 : ${latelyResult[0].insertId}`)
        await connection.commit(); // 커밋

    } catch (err) {
        logger.error(`App - product Service error\n: ${err.message}`);
        await connection.rollback(); //롤백
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release(); // conn 회수
    }
};

exports.deleteLatelyProducts = async function (latelyProcutIds,userId) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction(); 

        var deleteResult = 0;
        for(i=0; latelyProcutIds.length > i; i++){
            const deleteLatelyProducts = await productDao.deleteLatelyProductId(connection, latelyProcutIds[i],userId);
            console.log(`삭제된 최근 본 상품 수: ${deleteLatelyProducts[0].changedRows}`);
            deleteResult = deleteResult + deleteLatelyProducts[0].changedRows;
        }

        
        await connection.commit() // 커밋
        return {deletedProducts:deleteResult};


    } catch (err) {
        logger.error(`App - product Service error\n: ${err.message}`);
        await connection.rollback(); //롤백
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release(); // conn 회수
    }
};