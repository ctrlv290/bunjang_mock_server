

async function selectProducts(connection,userId,categoryG,categoryM,categoryS,orderby,page) {
    var whereQry = '';
    var orderbyQry = 'ORDER BY RAND()';

    var pageQry = '';
    if(!isNaN(page) && page > 0){
        var offset = 30;
        var page = (page-1) * offset
        pageQry = `LIMIT ${page},${offset}`;
    }

    if (orderby){
        if(orderby == 'new') {
            orderby = 'P.createdAt desc';
        }
        if (orderby == 'pop') {
            orderby = 'a.views desc';
        }
        if (orderby == 'high') {
            orderby = 'price desc';
        }
        if (orderby == 'low') {
            orderby = 'price asc';
        }
        orderbyQry = `ORDER BY ${orderby}`
    }

    if (categoryG){
        whereQry += ` AND categoryGId = ${categoryG}`;  
    }
    if (categoryM){
        whereQry += ` AND categoryMId = ${categoryM}`;   
    }
    if (categoryS){
        whereQry += ` AND categorySId = ${categoryS}`;  
    }
    
    const selectProductsQuery = `
        SELECT
            P.productId, 
            P.productName, 
            PI.productImg,
            P.price,
            U.marketName,
            U.marketImg,
            CASE 
                WHEN TIMESTAMPDIFF(SECOND,P.createdAt,NOW()) < 60
                    THEN CONCAT(TIMESTAMPDIFF(SECOND,P.createdAt,NOW()),'초전')
                WHEN TIMESTAMPDIFF(MINUTE,P.createdAt,NOW()) < 60
                    THEN CONCAT(TIMESTAMPDIFF(MINUTE,P.createdAt,NOW()),'분전')
                WHEN TIMESTAMPDIFF(HOUR,P.createdAt,NOW()) < 24
                    THEN CONCAT(TIMESTAMPDIFF(HOUR,P.createdAt,NOW()),'시간전')
                WHEN TIMESTAMPDIFF(DAY ,P.createdAt,NOW()) < 7
                    THEN CONCAT(TIMESTAMPDIFF(DAY ,P.createdAt,NOW()),'일전')
                WHEN TIMESTAMPDIFF(WEEK,P.createdAt,NOW()) < 5
                    THEN CONCAT(TIMESTAMPDIFF(WEEK,P.createdAt,NOW()),'주전')
                WHEN TIMESTAMPDIFF(MONTH,P.createdAt,NOW()) < 5
                    THEN CONCAT(TIMESTAMPDIFF(MONTH,P.createdAt,NOW()),'개월전')
                ELSE CONCAT(TIMESTAMPDIFF(YEAR,P.createdAt,NOW()),'년전')
            End AS lastDay, 
            IFNULL (D.status,'N') AS dibs
        FROM Product P
            LEFT JOIN Dibs D ON P.productId = D.productId AND D.userId = ${userId}
            LEFT JOIN ProductImage PI ON P.productId = PI.productId AND PI.num =1 AND PI.status ='N'
            LEFT JOIN User U ON P.userId = U.userId
            LEFT JOIN (
                SELECT P.productId, COUNT(V.viewsId) AS views FROM Product P
                INNER JOIN Views V ON P.productId = V.productId
                GROUP BY productId
            ) a ON P.productId = a.productId
        WHERE 1=1
            AND P.userId != ${userId}
            ${whereQry}
        GROUP BY productId
        ${orderbyQry}
        ${pageQry};
    `;
    const [selectProductRow] = await connection.query(selectProductsQuery);
  
    return selectProductRow;
}

async function selectProductId(connection,userId,productId) {
    const selectProductIdQuery = `
    SELECT P.productId, price, productName,P.description,
    CASE 
        WHEN TIMESTAMPDIFF(SECOND,P.createdAt,NOW()) < 60
            THEN CONCAT(TIMESTAMPDIFF(SECOND,P.createdAt,NOW()),'초전')
        WHEN TIMESTAMPDIFF(MINUTE,P.createdAt,NOW()) < 60
            THEN CONCAT(TIMESTAMPDIFF(MINUTE,P.createdAt,NOW()),'분전')
        WHEN TIMESTAMPDIFF(HOUR,P.createdAt,NOW()) < 24
            THEN CONCAT(TIMESTAMPDIFF(HOUR,P.createdAt,NOW()),'시간전')
        WHEN TIMESTAMPDIFF(DAY ,P.createdAt,NOW()) < 7
            THEN CONCAT(TIMESTAMPDIFF(DAY ,P.createdAt,NOW()),'일전')
        WHEN TIMESTAMPDIFF(WEEK,P.createdAt,NOW()) < 5
            THEN CONCAT(TIMESTAMPDIFF(WEEK,P.createdAt,NOW()),'주전')
        WHEN TIMESTAMPDIFF(MONTH,P.createdAt,NOW()) < 5
            THEN CONCAT(TIMESTAMPDIFF(MONTH,P.createdAt,NOW()),'개월전')
       ELSE CONCAT(TIMESTAMPDIFF(YEAR,P.createdAt,NOW()),'년전')
        End AS lastDay,
        IFNULL (a.views,0) AS views,
        IFNULL (b.dibs,0) AS dibs,
        CASE
        WHEN P.areaId = 0 THEN '지역정보없음' ELSE A.AreaName END AS area,
        CASE
        WHEN P.newProduct = 'N' THEN '중고' ELSE '새상품' END AS newProduct,
        CASE
        WHEN P.shippingFee = 'N' THEN '배송비별도' ELSE '배송비포함' END AS shippingFee,
        qty,
        P.categorySId,
        CS.categoryName,
        f.questions,
        U.userId AS sellerId,
        U.marketImg,
        U.marketName,
        IFNULL (c.follows,0) AS followsCount,
        IFNULL (d.status,'N') AS isFollow,
        e.otherProductsCount,
        g.reviewsCount,
        round(g.grade,1) AS grade
    FROM Product P
    LEFT JOIN Area A On P.areaId = A.areaId 
    LEFT JOIN CategoryS CS ON P.categorySId = CS.categorySId
    LEFT JOIN User U ON P.userId = U.UserId
    LEFT JOIN (
                    SELECT P.productId, COUNT(V.viewsId) AS views 
                    FROM Product P
                    INNER JOIN Views V ON P.productId = V.productId
                    WHERE V.status = 'N'
                    GROUP BY P.productId
                ) a ON P.productId = a.productId
    LEFT JOIN (
                    SELECT P.productId, COUNT(D.dibsId) AS dibs 
                    FROM Product P
                    INNER JOIN Dibs D ON P.productId = D.productId
                    WHERE D.status = 'Y'
                    AND P.productId = ${productId}
                    GROUP BY P.productId
                ) b ON P.productId = b.productId
    LEFT JOIN (
                    SELECT P.productId, COUNT(F.followId) AS follows 
                    FROM Product P
                    INNER JOIN Follow F ON P.userId = F.targetId
                    WHERE F.status = 'Y'
                    GROUP BY P.productId
                ) c ON P.productId = c.productId
    LEFT JOIN (
                    SELECT P.productId, F.status FROM Product P
                    INNER JOIN Follow F ON P.userId = F.targetId
                    AND F.userId = ${userId}
                ) d ON P.productId = d.productId
    LEFT JOIN (
                    SELECT P.userId, COUNT(P.productId) AS otherProductsCount 
                    FROM Product P
                    WHERE P.status = 'N'
                    GROUP BY P.userId
                ) e ON P.userId = e.userId
    LEFT JOIN (
                    SELECT P.productId, COUNT(P.productId) AS questions 
                    FROM Product P
                    INNER JOIN Question Q ON P.productId = Q.productId
                    WHERE Q.status = 'N'
                    GROUP BY P.productId
                ) f ON P.productId = f.productId  
    LEFT JOIN (
                    SELECT P.productId, AVG(grade) AS grade, COUNT(P.productId) AS reviewsCount 
                    FROM Product P
                    INNER JOIN Review R ON P.productId = R.productId
                    WHERE R.status = 'N'
                    GROUP BY R.productId
                ) g ON P.productId = g.productId
    WHERE P.productId = ${productId};
                  `;
    const [selectProductIdGRows] = await connection.query(selectProductIdQuery);
    return {productInfo:selectProductIdGRows};
}

async function selectProductIdImg(connection,productId) {
    const selectProductIdImgQuery = `
                  SELECT imageId,productImg
                  FROM ProductImage
                  WHERE 1=1 
                  And status = 'N'
                  And productId = ${productId}
                  Order By num ASC;
                  `;
    const [selectProductIdImgRows] = await connection.query(selectProductIdImgQuery);
    return {productimg : selectProductIdImgRows};
}

async function selectProductIdTag(connection,productId) {
    const selectProductIdTagQuery = `
                  SELECT tagId,tagName
                  FROM Tag
                  WHERE 1=1 
                  And status = 'N'
                  And productId = ${productId}
                  Order By num ASC;
                  `;
    const [selectProductIdTagRows] = await connection.query(selectProductIdTagQuery);
    return {productTag : selectProductIdTagRows};
}

async function selectSellerOtherProducts(connection,productId) {
    const selectSellerOtherProductsQuery = `
                SELECT P.productId, P.price,PI.productImg FROM (
                    SELECT userId from Product P
                    WHERE productId = ${productId}
                ) U
                LEFT JOIN Product P ON U.userId = P.userId
                LEFT JOIN (
                    SELECT productImg,productId,createdAt FROM ProductImage
                    WHERE 1=1 
                    AND status = 'N'
                    GROUP BY productId
                ) PI ON P.productId = PI.productId
                ORDER BY P.createdAt DESC
                LIMIT 6;
                  `;
    const [selectSellerOtherProductsRows] = await connection.query(selectSellerOtherProductsQuery);
    return {sellerOtherProducts : selectSellerOtherProductsRows};
}

async function selectSellerReviewsPreviews(connection,productId) {
    const selectSellerReviewsPreviewsQuery = `
                SELECT R.fromId, U.marketName, U.marketImg, P.productName,R.grade, 
                CASE 
                    WHEN TIMESTAMPDIFF(SECOND,R.createdAt,NOW()) < 60
                        THEN CONCAT(TIMESTAMPDIFF(SECOND,R.createdAt,NOW()),'초전')
                    WHEN TIMESTAMPDIFF(MINUTE,R.createdAt,NOW()) < 60
                        THEN CONCAT(TIMESTAMPDIFF(MINUTE,R.createdAt,NOW()),'분전')
                    WHEN TIMESTAMPDIFF(HOUR,R.createdAt,NOW()) < 24
                        THEN CONCAT(TIMESTAMPDIFF(HOUR,R.createdAt,NOW()),'시간전')
                    WHEN TIMESTAMPDIFF(DAY ,R.createdAt,NOW()) < 7
                        THEN CONCAT(TIMESTAMPDIFF(DAY ,R.createdAt,NOW()),'일전')
                    WHEN TIMESTAMPDIFF(WEEK,R.createdAt,NOW()) < 5
                        THEN CONCAT(TIMESTAMPDIFF(WEEK,R.createdAt,NOW()),'주전')
                    WHEN TIMESTAMPDIFF(MONTH,R.createdAt,NOW()) < 5
                        THEN CONCAT(TIMESTAMPDIFF(MONTH,R.createdAt,NOW()),'개월전')
                    ELSE CONCAT(TIMESTAMPDIFF(YEAR,R.createdAt,NOW()),'년전')
                End AS lastDay, 
                R.comment FROM (
                SELECT userId from Product P
                WHERE productId = ${productId}
                ) UI
                LEFT JOIN (
                SELECT productId,toId,fromId,grade,comment,createdAt FROM Review
                WHERE 1=1 
                AND status = 'N'
                ) R ON UI.userId = R.toId
                LEFT JOIN User U ON U.userId = R.fromId
                LEFT JOIN Product P ON P.productId = R.productId
                LIMIT 2;
                  `;
    const [selectSellerReviewsPreviewsRows] = await connection.query(selectSellerReviewsPreviewsQuery);
    return {sellerReviewsPreviews : selectSellerReviewsPreviewsRows};
}
  
async function insertProduct(connection, insertProductParams) {
    const insertProductQuery = `
          INSERT INTO Product(userId, 
            productName, description, price, shippingFee, 
            negotiation, areaId,
            categoryGId,categoryMId,categorySId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
    const insertProductRow = await connection.query(insertProductQuery,insertProductParams);
  
    return insertProductRow;
}
  

async function insertProductImg(connection, productId, productImg, num) {
    const insertProductImgQuery = `
          INSERT INTO ProductImage(productId, productImg, num)
          VALUES ('${productId}', '${productImg}', '${num}');
      `;
    const insertProductImgRow = await connection.query(insertProductImgQuery);
  
    return insertProductImgRow;
}

async function insertProductTag(connection, productId, tagName, num) {
    const insertProductTagQuery = `
          INSERT INTO Tag(productId, tagName, num)
          VALUES ('${productId}', '${tagName}', '${num}');
      `;
    const insertProductTagRow = await connection.query(insertProductTagQuery);
  
    return insertProductTagRow;
}

async function selectCategoryG(connection) {
    const selectCategoryGQuery = `
                  SELECT categoryGId,categoryName
                  FROM CategoryG
                  WHERE status = 'N';
                  `;
    const [selectCategoryGRows] = await connection.query(selectCategoryGQuery);
    return selectCategoryGRows;
}

async function selectCategoryM(connection,categoryGId) {
    const selectCategoryMQuery = `
                SELECT M.categoryMId,M.categoryName, IFNULL(a.count,0) AS count FROM CategoryM M
                LEFT JOIN (
                    SELECT categoryMId, COUNT(categoryMId) AS count FROM Product 
                    WHERE status = 'N'
                    GROUP BY categoryMId
                ) a ON M.categoryMId = a.categoryMId
                WHERE 1=1
                AND M.categoryGId = ${categoryGId}
                AND M.status = 'N'
                `;
    const [selectCategoryMRows] = await connection.query(selectCategoryMQuery);
    return selectCategoryMRows;
}

  async function selectCategoryS(connection,categoryMId) {
    const selectCategorySQuery = `
                SELECT S.categorySId,S.categoryName, IFNULL(a.count,0) AS count FROM CategoryS S
                LEFT JOIN (
                    SELECT categorySId, COUNT(categorySId) AS count FROM Product 
                    WHERE status = 'N'
                    GROUP BY categorySId
                ) a ON S.categorySId = a.categorySId
                WHERE 1=1
                AND S.categoryMId = ${categoryMId}
                AND S.status = 'N'
                  `;
    const [selectCategorySRows] = await connection.query(selectCategorySQuery);
    return selectCategorySRows;
}

async function selectQuestions(connection,productId) {
    const selectQuestionsQuery = `
                SELECT questionId, Q.userId, U.marketName, U.marketImg,
                CASE 
                    WHEN TIMESTAMPDIFF(SECOND,Q.createdAt,NOW()) < 60
                        THEN CONCAT(TIMESTAMPDIFF(SECOND,Q.createdAt,NOW()),'초전')
                    WHEN TIMESTAMPDIFF(MINUTE,Q.createdAt,NOW()) < 60
                        THEN CONCAT(TIMESTAMPDIFF(MINUTE,Q.createdAt,NOW()),'분전')
                    WHEN TIMESTAMPDIFF(HOUR,Q.createdAt,NOW()) < 24
                        THEN CONCAT(TIMESTAMPDIFF(HOUR,Q.createdAt,NOW()),'시간전')
                    WHEN TIMESTAMPDIFF(DAY ,Q.createdAt,NOW()) < 7
                        THEN CONCAT(TIMESTAMPDIFF(DAY ,Q.createdAt,NOW()),'일전')
                    WHEN TIMESTAMPDIFF(WEEK,Q.createdAt,NOW()) < 5
                        THEN CONCAT(TIMESTAMPDIFF(WEEK,Q.createdAt,NOW()),'주전')
                    WHEN TIMESTAMPDIFF(MONTH,Q.createdAt,NOW()) < 5
                        THEN CONCAT(TIMESTAMPDIFF(MONTH,Q.createdAt,NOW()),'개월전')
                    ELSE CONCAT(TIMESTAMPDIFF(YEAR,Q.createdAt,NOW()),'년전')
                End AS lastDay,
                Q.content
                From Question Q
                LEFT JOIN User U ON Q.userId = U.userId
                WHERE 1=1
                AND productId = ${productId}
                AND Q.status = 'N'
                  `;
    const [selectQuestionsRows] = await connection.query(selectQuestionsQuery);
    return selectQuestionsRows;
}

async function insertQuestion(connection, userId, productId, content) {
    const insertQuestionQuery = `
          INSERT INTO Question(userId, productId, content)
          VALUES ('${userId}', '${productId}', '${content}');
      `;
    const insertQuestionRow = await connection.query(insertQuestionQuery);
  
    return insertQuestionRow;
}

async function deleteQuestion(connection, questionId) {
    const deleteQuestionQuery = `
            UPDATE Question
            SET 
            status = 'Y'
            WHERE 1=1
            And questionId = '${questionId}'
      `;
    const deleteQuestionRow = await connection.query(deleteQuestionQuery);
  
    return deleteQuestionRow;
}

async function insertViews(connection, userId, productId) {
    const insertViewsQuery = `
          INSERT INTO Views(userId, productId)
          VALUES ('${userId}', '${productId}');
      `;
    const insertViewsRow = await connection.query(insertViewsQuery);
  
    return insertViewsRow;
}

async function insertLately(connection, userId, productId) {
    const insertViewsQuery = `
          INSERT INTO LatelyProduct(userId, productId)
          VALUES ('${userId}', '${productId}');
      `;
    const insertViewsRow = await connection.query(insertViewsQuery);
  
    return insertViewsRow;
}

async function selectLatelyProducts(connection,userId,page) {

    var pageQry = '';
    if(!isNaN(page) && page > 0){
        var offset = 30;
        var page = (page-1) * offset
        pageQry = `LIMIT ${page},${offset}`;
    }

    const selectLatelyProductsQuery = `             
            SELECT
            LP.latelyProductId,
            LP.productId, 
            P.productName, 
            PI.productImg,
            P.price,
            CASE 
            WHEN TIMESTAMPDIFF(SECOND,P.createdAt,NOW()) < 60
                THEN CONCAT(TIMESTAMPDIFF(SECOND,P.createdAt,NOW()),'초전')
            WHEN TIMESTAMPDIFF(MINUTE,P.createdAt,NOW()) < 60
                THEN CONCAT(TIMESTAMPDIFF(MINUTE,P.createdAt,NOW()),'분전')
            WHEN TIMESTAMPDIFF(HOUR,P.createdAt,NOW()) < 24
                THEN CONCAT(TIMESTAMPDIFF(HOUR,P.createdAt,NOW()),'시간전')
            WHEN TIMESTAMPDIFF(DAY ,P.createdAt,NOW()) < 7
                THEN CONCAT(TIMESTAMPDIFF(DAY ,P.createdAt,NOW()),'일전')
            WHEN TIMESTAMPDIFF(WEEK,P.createdAt,NOW()) < 5
                THEN CONCAT(TIMESTAMPDIFF(WEEK,P.createdAt,NOW()),'주전')
            WHEN TIMESTAMPDIFF(MONTH,P.createdAt,NOW()) < 5
                THEN CONCAT(TIMESTAMPDIFF(MONTH,P.createdAt,NOW()),'개월전')
            ELSE CONCAT(TIMESTAMPDIFF(YEAR,P.createdAt,NOW()),'년전')
            End AS lastDay
            FROM LatelyProduct LP
            LEFT JOIN Product P ON LP.productId = P.ProductId
            LEFT JOIN ProductImage PI ON P.productId = PI.productId AND PI.num =1 AND PI.status ='N'
            WHERE 1=1
            AND LP.status = 'N'
            AND LP.userId = ${userId}
            GROUP BY productId
            ORDER BY LP.createdAt DESC
            ${pageQry}
            ;
                  `;
    const [selectLatelyProductsRows] = await connection.query(selectLatelyProductsQuery);
    return selectLatelyProductsRows;
}

async function deleteLatelyProductId(connection, latelyProductId, userId) {

    const deleteLatelyProductIdQuery = `
          UPDATE LatelyProduct
          SET status = 'Y'
          WHERE 1=1
          And latelyProductId = '${latelyProductId}'
          And userId = '${userId}';
      `;
  
    const deleteLatelyProductIdRow = await connection.query(deleteLatelyProductIdQuery);
  
    return deleteLatelyProductIdRow;
}

async function findBeforeProductImgCnt(connection, productId) {
    const selectProductImgCntQuery = `
                SELECT 
                    COUNT(imageId) AS beforeCNT 
                FROM ProductImage 
                WHERE 1=1
                And productId = ${productId} 
                AND status = 'N'
                  `;
    const selectProductImgCntRow = await connection.query(selectProductImgCntQuery);
    return selectProductImgCntRow[0];
}

async function findBeforeProductImgId(connection, productId) {
    const selectProductImgIdQuery = `
                SELECT 
                    imageId
                FROM ProductImage 
                WHERE 1=1
                And productId = ${productId} 
                AND status = 'N'
                ORDER BY num ASC
                  `;
    const [selectProductImgIdRows] = await connection.query(selectProductImgIdQuery);
    return selectProductImgIdRows;
}

async function updateProductImg(connection, imageId, productImg, num) {
    const updateProductImgQuery = `
                UPDATE ProductImage
                SET productImg = '${productImg}',
                num = ${num}
                WHERE 1=1
                And imageId = '${imageId}';
                  `;
    const updateProductImgRows = await connection.query(updateProductImgQuery);
    return updateProductImgRows;
}

async function deleteProductImg(connection, imageId, num) {
    const deleteProductImgQuery = `
                UPDATE ProductImage
                SET status = 'Y'
                WHERE 1=1
                And imageId = '${imageId}'
                And num = '${num}';
                  `;
    const deleteProductImgRows = await connection.query(deleteProductImgQuery);
    return deleteProductImgRows;
}

async function updateProduct(connection, productId, updateProductParams) {
    const insertProductQuery = `
            UPDATE Product
                SET productName = ?, 
                description = ?, 
                price = ?, 
                shippingFee = ?, 
                negotiation = ?, 
                areaId = ?,
                categoryGId = ?, 
                categoryMId = ?,
                categorySId = ?
            WHERE productId = ${productId};
      `;
    const insertProductRow = await connection.query(insertProductQuery,updateProductParams);
  
    return insertProductRow;
}

async function findBeforeProductTagCnt(connection, productId) {
    const selectProductImgCntQuery = `
                SELECT 
                    COUNT(tagId) AS beforeCNT 
                FROM Tag 
                WHERE 1=1
                And productId = ${productId} 
                AND status = 'N'
                  `;
    const selectProductImgCntRow = await connection.query(selectProductImgCntQuery);
    return selectProductImgCntRow[0];
}

async function findBeforeProductTagId(connection, productId) {
    const selectProductImgIdQuery = `
                SELECT 
                    tagId
                FROM Tag 
                WHERE 1=1
                And productId = ${productId} 
                AND status = 'N'
                ORDER BY num ASC
                  `;
    const [selectProductImgIdRows] = await connection.query(selectProductImgIdQuery);
    return selectProductImgIdRows;
}

async function updateProductTag(connection, tagId, tagName, num) {
    const updateProductTagQuery = `
                UPDATE Tag
                SET tagName = '${tagName}',
                num = ${num}
                WHERE 1=1
                And tagId = '${tagId}';
                  `;
    const updateProductTagRows = await connection.query(updateProductTagQuery);
    return updateProductTagRows;
}

async function deleteProductTag(connection, tagId, num) {
    const deleteProductImgQuery = `
                UPDATE Tag
                SET status = 'Y'
                WHERE 1=1
                And tagId = '${tagId}'
                And num = '${num}';
                  `;
    const deleteProductImgRows = await connection.query(deleteProductImgQuery);
    return deleteProductImgRows;
}

async function patchProductId(connection, userId, productId, isDelete, salesStatus) {
    var setQry = '';
    if(isDelete && !isNaN(salesStatus)){
        setQry = `status = 'Y' , salesStatus = ${salesStatus}`
    }else if(isDelete && isNaN(salesStatus)){
        setQry = `status = 'Y'`
    }else if(!isDelete && !isNaN(salesStatus)){
        setQry = `salesStatus = ${salesStatus}`
    }
    const patchProductIdQuery = `
                UPDATE Product
                SET 
                ${setQry}
                WHERE 1=1
                And userId = '${userId}'
                And productId = '${productId}';
                  `;
    const patchProductIsRows = await connection.query(patchProductIdQuery);
    return patchProductIsRows;
}

async function selectDibsProduct(connection,productId) {
    const selectDibsProductQuery = `     
            SELECT
                P.productId,
                PI.productImg, 
                CASE WHEN P.negotiation = 'Y' THEN '연락요망'
                ELSE CONCAT(FORMAT(P.price,0),'원') 
                END AS price,
                P.productName,
                CASE 
                WHEN TIMESTAMPDIFF(SECOND,P.createdAt,NOW()) < 60
                    THEN CONCAT(TIMESTAMPDIFF(SECOND,P.createdAt,NOW()),'초전')
                WHEN TIMESTAMPDIFF(MINUTE,P.createdAt,NOW()) < 60
                    THEN CONCAT(TIMESTAMPDIFF(MINUTE,P.createdAt,NOW()),'분전')
                WHEN TIMESTAMPDIFF(HOUR,P.createdAt,NOW()) < 24
                    THEN CONCAT(TIMESTAMPDIFF(HOUR,P.createdAt,NOW()),'시간전')
                WHEN TIMESTAMPDIFF(DAY ,P.createdAt,NOW()) < 7
                    THEN CONCAT(TIMESTAMPDIFF(DAY ,P.createdAt,NOW()),'일전')
                WHEN TIMESTAMPDIFF(WEEK,P.createdAt,NOW()) < 5
                    THEN CONCAT(TIMESTAMPDIFF(WEEK,P.createdAt,NOW()),'주전')
                WHEN TIMESTAMPDIFF(MONTH,P.createdAt,NOW()) < 5
                    THEN CONCAT(TIMESTAMPDIFF(MONTH,P.createdAt,NOW()),'개월전')
                ELSE CONCAT(TIMESTAMPDIFF(YEAR,P.createdAt,NOW()),'년전')
            End AS lastDay
            FROM Product P
            LEFT JOIN ProductImage PI ON P.productId = PI.productId AND PI.num =1 AND PI.status ='N'
            WHERE 1=1
            AND P.productId = ${productId}
            ;
                  `;
    const [selectDibsProductRows] = await connection.query(selectDibsProductQuery);
    return selectDibsProductRows;
}

async function selectDibsUsers(connection,productId) {
    const selectDibsProductQuery = `     
            SELECT 
                D.userId AS sellerId, 
                U.marketName, 
                U.marketIntro, 
                marketImg 
            FROM Dibs D
            LEFT JOIN User U ON U.userId = D.userID 
            WHERE productId = ${productId}
            ;
                  `;
    const [selectDibsProductRows] = await connection.query(selectDibsProductQuery);
    return selectDibsProductRows;
}

async function selectProductUserId(connection,productId) {
    const selectDibsProductQuery = `     
            SELECT 
                userId
            FROM Product
            WHERE productId = ${productId}
            ;
                  `;
    const [selectDibsProductRows] = await connection.query(selectDibsProductQuery);
    return selectDibsProductRows;
}

async function selectQuestionsUserId(connection,userId, questionId) {
    const selectDibsProductQuery = `     
            SELECT 
                userId
            FROM Question
            WHERE questionId = ${questionId}
            AND userId = ${userId};
            ;
                  `;
    const [selectDibsProductRows] = await connection.query(selectDibsProductQuery);
    return selectDibsProductRows;
}
  
  module.exports = {
    selectProducts,
    selectProductId,
    selectProductIdImg,
    selectProductIdTag,
    selectSellerOtherProducts,
    selectSellerReviewsPreviews,
    insertProduct,
    insertProductImg,
    insertProductTag,
    selectCategoryG,
    selectCategoryM,
    selectCategoryS,
    insertQuestion,
    insertViews,
    insertLately,
    selectQuestions,
    selectLatelyProducts,
    deleteLatelyProductId,
    findBeforeProductImgCnt,
    findBeforeProductImgId,
    updateProductImg,
    deleteProductImg,
    updateProduct,
    findBeforeProductTagCnt,
    findBeforeProductTagId,
    updateProductTag,
    deleteProductTag,
    patchProductId,
    selectDibsProduct,
    selectDibsUsers,
    deleteQuestion,
    selectProductUserId,
    selectQuestionsUserId
  };