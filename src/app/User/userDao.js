
// sns id check
async function selectUserSnsId(connection, snsIdcol, snsId) {

  const selectSnsUserIdQuery = `
                SELECT userId
                FROM User
                WHERE ${snsIdcol} = '${snsId}'
                AND status = 'N';
                `;
  const [userRows] = await connection.query(selectSnsUserIdQuery);
  return userRows;
}

async function selectUserMarketName(connection, marketName) {

  const selectSnsUserIdQuery = `
                SELECT userId
                FROM User
                WHERE marketName = '${marketName}';
                `;
  const [userRows] = await connection.query(selectSnsUserIdQuery);
  return userRows;
}

async function insertUser(connection, snsIdcol, snsId, marketName) {
  const insertUserInfoQuery = `
        INSERT INTO User(${snsIdcol}, marketName)
        VALUES ('${snsId}', '${marketName}');
    `;
  const insertUserInfoRow = await connection.query(insertUserInfoQuery);

  return insertUserInfoRow;
}

async function selectAccount(connection, userId) {

  const selectAccountQuery = `
                SELECT 
                  accountId,
                  bankName,
                  accountHolder,
                  accountNum,
                  adjustment,
                  refund
                FROM Account
                WHERE userId = ${userId}
                AND status = 'N'
                ;
                `;
  const [selectAccount] = await connection.query(selectAccountQuery);
  return selectAccount;
}

async function selectMyShop(connection, userId, type) {
  if(type == null)
      type = 0
  const selectMyShopQuery = `
                SELECT 
                  U.userId, 
                  U.marketName, 
                  U.marketImg,
                  IFNULL(G.grade,0) AS grade,
                  IFNULL(D.dibs,0) AS dibs,
                  IFNULL(R.reviews,0) AS reviews,
                  IFNULL(FWE.follower,0) AS follower,
                  IFNULL(FWI.following,0) AS following,
                  IFNULL(P.products,0) AS products
                FROM User U 
                LEFT JOIN (
                  SELECT 
                  toId, ROUND(AVG(grade),1) AS grade 
                  FROM Review
                  WHERE status = 'N'
                  GROUP BY toId
                ) G ON U.userId = G.toId
                LEFT JOIN (
                  SELECT userId, COUNT(dibsId) AS dibs FROM Dibs
                  WHERE status = 'Y'
                  GROUP BY userId
                ) D ON U.userId = D.userId
                LEFT JOIN (
                  SELECT fromId, COUNT(reviewId) AS reviews 
                  FROM Review
                  WHERE status = 'N'
                  GROUP BY fromId
                ) R ON U.userId = R.fromId
                LEFT JOIN (
                  SELECT targetId, COUNT(followId) AS follower 
                  FROM Follow
                  WHERE status = 'Y'
                  GROUP BY targetId
                ) FWE ON U.userId = FWE.targetId
                LEFT JOIN (
                  SELECT userId, COUNT(followId) AS following 
                  FROM Follow
                  WHERE status = 'Y'
                  GROUP BY userId
                ) FWI ON U.userId = FWI.userId
                LEFT JOIN (
                  SELECT userId, COUNT(productId) AS products FROM Product
                  WHERE status = 'N'
                  AND salesStatus = ${type}
                  GROUP BY userId
                ) P ON U.userId = P.userId
                WHERE U.userId = ${userId};
                `;
  const [selectMyShop] = await connection.query(selectMyShopQuery);
  return selectMyShop;
}

async function selectMyShopProduct(connection, userId, type , orderby, page) {
    if(type == null)
      type = 0
    var orderbyQry = 'P.createdAt desc';

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
  const selectMyShopProductQuery = `
                SELECT 
                  P.productId,
                  PI.productImg, 
                  CASE WHEN P.negotiation = 'Y' THEN '연락요망'
                  ELSE CONCAT(FORMAT(P.price,0),'원') 
                  END AS price,
                  P.productName
                FROM User U 
                LEFT JOIN Product P ON U.userId = P.userId AND P.status = 'N'
                LEFT JOIN ProductImage PI ON P.productId = PI.productId AND PI.num =1 AND PI.status ='N'
                LEFT JOIN (
                  SELECT P.productId, COUNT(V.viewsId) AS views FROM Product P
                  INNER JOIN Views V ON P.productId = V.productId
                  GROUP BY productId
                ) a ON P.productId = a.productId
                WHERE 1=1
                  AND salesStatus = ${type}
                  AND U.userId = ${userId}
                ORDER BY ${orderbyQry}
                ${pageQry};
                `;
  const [selectMyShopProducts] = await connection.query(selectMyShopProductQuery);
  return selectMyShopProducts;
}

async function selectMyShippingAddress(connection, userId) {

  const selectMyShippingAddressQuery = `
                SELECT 
                  addressId,
                  recipient,
                  CONCAT(address,' ', detailAddress,' (',zipCode,')') AS fullAddress,
                  address,
                  detailAddress, 
                  zipCode,
                  comment,
                  isDefault
                FROM MyShippingAddress
                WHERE userId = ${userId}
                ;
                `;
  const [selectMyShippingAddress] = await connection.query(selectMyShippingAddressQuery);
  return selectMyShippingAddress;
}

async function selectArea(connection, userId) {

  const selectAreaQuery = `
              SELECT areaId, areaName, areaRange, 
              CASE 
                WHEN certification = 'N' 
                THEN '인증하기'
                ELSE '인증완료'
              END AS certification 
              FROM Area
              WHERE 1=1 
              AND status = 'N'
              AND userId = ${userId};
                `;
  const [selectArea] = await connection.query(selectAreaQuery);
  return selectArea;
}

async function selectReviews(connection, sellerId) {

  const selectReviewsQuery = `
              SELECT R.reviewId, R.fromId AS userId, U.marketImg, U.marketName,P.productName,R.grade,
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
              R.comment
              FROM Review R
              LEFT JOIN User U ON U.userId = R.fromId
              LEFT JOIN Product P ON P.productId = R.productId
              WHERE 1=1 
              AND R.toId = ${sellerId}
              AND R.status = 'N'
              ORDER BY R.createdAt DESC;
                `;
  const [selectReviews] = await connection.query(selectReviewsQuery);
  return selectReviews;
}

async function selectDibs(connection, userId, page) {
  var pageQry = '';
  if(!isNaN(page) && page > 0){
      var offset = 30;
      var page = (page-1) * offset
    pageQry = `LIMIT ${page},${offset}`;
  }

  const selectDibsQuery = `
              SELECT 
              P.productId,
              PI.productImg, 
              CASE WHEN P.negotiation = 'Y' THEN '연락요망'
                ELSE CONCAT(FORMAT(P.price,0),'원') 
              END AS price,
              P.productName,
              U.marketImg,
              U.marketName,
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
            D.status as dibs
            FROM Dibs D
            LEFT JOIN Product P ON D.productId = P.productId
            LEFT JOIN ProductImage PI ON P.productId = PI.productId AND PI.num =1 AND PI.status ='N'
            LEFT JOIN User U ON P.userId = U.userId
            WHERE 1=1
            AND D.userId = ${userId}
            AND D.status = 'Y'
            ORDER BY D.updatedAt DESC
            ${pageQry}
            ;
                `;
  const [selectDibs] = await connection.query(selectDibsQuery);
  return selectDibs;
}

async function findFollowId(connection, userId, sellerId) {
  const selectFollowIdQuery = `
              SELECT 
              followId,
              status
              FROM Follow
              WHERE 1=1
              And userId = ${userId}
              And targetId = ${sellerId};
                `;
  const selectFollowIdRows = await connection.query(selectFollowIdQuery);
  return selectFollowIdRows[0];
}

async function findDibsId(connection, userId, productId) {
  const selectDibsIdQuery = `
              SELECT 
              dibsId,
              status
              FROM Dibs
              WHERE 1=1
              And userId = ${userId}
              And productId = ${productId};
                `;
  const selectDibsIdRows = await connection.query(selectDibsIdQuery);
  return selectDibsIdRows[0];
}

async function insertDibs(connection, dibsId, userId, productId, status) {

  const insertDibsQuery = `
        INSERT INTO Dibs(dibsId, userId, productId)
        VALUES (${dibsId}, ${userId}, ${productId})
        ON DUPLICATE KEY UPDATE 
        status = '${status}'
        ;
    `;
  const insertDibsRow = await connection.query(insertDibsQuery);

  return insertDibsRow;
}

async function insertFollowers(connection, followId, userId, sellerId, status, notification) {

  const insertFollowerQuery = `
        INSERT INTO Follow(followId, userId, targetId, notification)
        VALUES (${followId},${userId}, ${sellerId}, '${notification}')
        ON DUPLICATE KEY UPDATE 
        status = '${status}',
        notification = '${notification}';

    `;

  const insertFollowerRow = await connection.query(insertFollowerQuery);

  return insertFollowerRow;
}

async function insertReview(connection, userId, sellerId,productId, grade, comment) {

  const insertReviewQuery = `
        INSERT INTO Review( fromId, toId, productId, grade, comment)
        VALUES (${userId},${sellerId}, ${productId},${grade},'${comment}');
    `;

  const insertReviewRow = await connection.query(insertReviewQuery);

  return insertReviewRow;
}

async function insertAccount(connection, userId, bankName, accountNum, accountHolder) {

  const insertAccountQuery = `
        INSERT INTO Account(userId,bankName,accountNum,accountHolder)
        VALUES (${userId},'${bankName}', '${accountNum}','${accountHolder}');
    `;

  const insertAccountRow = await connection.query(insertAccountQuery);

  return insertAccountRow;
}

async function updateAccount(connection, accountId ,userId, bankName, accountNum, accountHolder) {

  const updateAccountQuery = `
        UPDATE Account 
        SET 
          bankName = '${bankName}',
          accountNum = '${accountNum}',
          accountHolder = '${accountHolder}'
        WHERE accountId = ${accountId}
        AND userId = ${userId};
    `;

  const updateAccountRow = await connection.query(updateAccountQuery);

  return updateAccountRow;
}

async function deleteAccount(connection, accountId ,userId) {

  const deleteAccountQuery = `
        UPDATE Account 
        SET 
          status = 'Y'
        WHERE accountId = ${accountId}
        AND userId = ${userId};
    `;

  const deleteAccountRow = await connection.query(deleteAccountQuery);

  return deleteAccountRow;
}

async function insertArea(connection, userId,areaName,areaRange,certification) {

  const insertAreaQuery = `
        INSERT INTO Area(userId,areaName, areaRange, certification)
        VALUES (${userId},'${areaName}', ${areaRange},'${certification}');
    `;

  const insertAreaRow = await connection.query(insertAreaQuery);

  return insertAreaRow;
}

async function selectFollowers(connection, userId, page) {
  var pageQry = '';
  if(!isNaN(page) && page > 0){
      var offset = 30;
      var page = (page-1) * offset
    pageQry = `LIMIT ${page},${offset}`;
  }

  const selectFollowersQuery = `
            SELECT 
              U.userId AS sellerId, 
              U.marketName, 
              U.marketImg,
              IFNULL(P.productCnt,0) AS productCnt, 
              IFNULL(FC.followCnt,0) AS followCnt
            FROM Follow F
            LEFT JOIN User U ON F.userId = U.userId
            LEFT JOIN (
              SELECT userId, COUNT(productID) AS productCnt FROM Product 
              WHERE status = 'N'
              GROUP BY userId
            ) P ON F.userId = P.userId
            LEFT JOIN (
              SELECT userId, COUNT(followId) AS followCnt FROM Follow
              WHERE status = 'Y'
              GROUP BY userId
            ) FC ON F.userId = FC.userId
            WHERE 1=1
            AND F.targetId = ${userId}
            AND F.status = 'Y'
            ${pageQry}
            ;
                `;
  const [selectFollowers] = await connection.query(selectFollowersQuery);
  return selectFollowers;
}

async function selectFeeds(connection, userId, page) {
  var pageQry = '';
  if(!isNaN(page) && page > 0){
      var offset = 30;
      var page = (page-1) * offset
    pageQry = `LIMIT ${page},${offset}`;
  }

  const selectFeedsQuery = `
            SELECT
              P.productId,
              PI.productImg,
              CASE WHEN P.negotiation = 'Y' THEN '연락요망'
                ELSE CONCAT(FORMAT(P.price,0),'원')
              END AS price,
              P.productName,
              U.marketImg,
              U.marketName
            FROM Follow F
            LEFT JOIN Product P ON P.userId = F.targetId
            LEFT JOIN ProductImage PI ON P.productId = PI.productId AND PI.num =1 AND PI.status ='N'
            LEFT JOIN User U ON P.userId = U.userId
            WHERE F.userId = ${userId}
            AND P.productId IS NOT NULL
            AND F.status = 'Y'
            AND P.status != 2
            ORDER BY P.createdAt DESC
            ${pageQry}
            ;
                `;
  const [selectFeeds] = await connection.query(selectFeedsQuery);
  return selectFeeds;
}

async function selectFollowing(connection, userId, page) {
  var pageQry = '';
  if(!isNaN(page) && page > 0){
      var offset = 30;
      var page = (page-1) * offset
    pageQry = `LIMIT ${page},${offset}`;
  }

  const selectFollowingQuery = `
              SELECT 
                U.userId AS sellerId, 
                U.marketName, 
                U.marketImg,
                F.notification,
                IFNULL(P.productCnt,0) AS productCnt, 
                IFNULL(FC.followCnt,0) AS followCnt
              FROM Follow F
              LEFT JOIN User U ON F.targetId = U.userId
              LEFT JOIN (
                SELECT userId, COUNT(productID) AS productCnt FROM Product 
                WHERE status = 'N'
                GROUP BY userId
              ) P ON F.targetId = P.userId
              LEFT JOIN (
                SELECT targetId, COUNT(followId) AS followCnt FROM Follow
                WHERE status = 'Y'
                GROUP BY targetId
              ) FC ON F.targetId = FC.targetId
              WHERE 1=1
              AND F.userId = ${userId}
              AND F.status = 'Y'
              AND productCnt > 0
              ${pageQry}
            ;
                `;
  const [selectFollowing] = await connection.query(selectFollowingQuery);
  return selectFollowing;
}

async function selectFollowRecommand(connection, userId, page) {
  var pageQry = '';
  if(!isNaN(page) && page > 0){
      var offset = 30;
      var page = (page-1) * offset
    pageQry = `LIMIT ${page},${offset}`;
  }

  const selectFollowRecommandQuery = `
                SELECT 
                  U.userId AS sellerId,
                  U.marketName,
                  U.marketImg,
                  IFNULL(P.productCnt,0) AS productCnt,
                  IFNULL(FC.followCnt,0) AS followCnt
                FROM  User U
                LEFT JOIN (SELECT * FROM Follow WHERE userId = ${userId} AND status='Y') F ON U.userId = F.targetId
                LEFT JOIN (
                  SELECT userId, COUNT(productID) AS productCnt FROM Product
                  WHERE status = 'N'
                  GROUP BY userId
                ) P ON U.userId = P.userId
                LEFT JOIN (
                  SELECT targetId, userId, COUNT(followId) AS followCnt FROM Follow
                  WHERE STATUS = 'Y'
                  GROUP BY targetId
                ) FC ON U.userId = FC.targetId
                WHERE 1=1
                AND U.userId != ${userId}
                AND F.followId IS NULL
                AND U.status = 'N'
                AND productCnt > 0
                ORDER BY RAND()
                ${pageQry}
              ;
                `;
  const [FollowRecommand] = await connection.query(selectFollowRecommandQuery);
  return FollowRecommand;
}

async function selectSomeProducts(connection, sellerId) {

  const selectSomeProductsQuery = `
              SELECT 
                P.productId,
                CASE WHEN P.negotiation = 'Y' THEN '연락요망'
                  ELSE CONCAT(FORMAT(P.price,0),'원') 
                END AS price,
                PI.productImg
              FROM Product P
              LEFT JOIN ProductImage PI ON P.productId = PI.productId AND PI.num =1 AND PI.status ='N'
              WHERE 1=1
              AND userId = ${sellerId}
              AND salesStatus !=2
              LIMIT 3;
            ;
                `;
  const [selectSomeProducts] = await connection.query(selectSomeProductsQuery);
  return selectSomeProducts;
}

async function selectUserInfo(connection, userId) {

  const selectUserInfoQuery = `
              SELECT 
                userId,
                gender,
                DATE_FORMAT(birth,'%Y년 %m월 %d일') as birth,
                hp,
                openHp,
                email,
                code,
                CASE WHEN kakaoId is not null THEN 'Y'
                ELSE 'N'
                END AS 'kakao',
                CASE WHEN naverId is not null THEN 'Y'
                ELSE 'N'
                END AS 'naver',
                CASE WHEN facebookId is not null THEN 'Y'
                ELSE 'N'
                END AS 'facebook'
              FROM User
              WHERE userId = ${userId};
                `;
  const [selectUserInfo] = await connection.query(selectUserInfoQuery);
  return selectUserInfo;
}

async function deleteReview(connection, userId, reviewId) {
  const deleteReviewQuery = `
          UPDATE Review
          SET 
          status = 'Y'
          WHERE 1=1
          And reviewId = ${reviewId}
          And fromId = ${userId}
    `;
  const deleteReviewRow = await connection.query(deleteReviewQuery);

  return deleteReviewRow;
}

async function insertAddress(connection, insertAddressParams) {
  const insertAddressQuery = `
        INSERT INTO MyShippingAddress(
            userId,
            recipient,
            hp,
            zipCode,
            address,
            detailAddress,
            comment,
            isDefault)
        VALUES (?, ?, ?, ?, ?, ?, ?,?);
    `;
  const insertAddressRow = await connection.query(insertAddressQuery,insertAddressParams);

  return insertAddressRow;
}

async function updateAddress(connection, updateAddressParams,addressId) {
  const updateAddressQuery = `
            UPDATE MyShippingAddress
            SET  
            recipient = ?,
            hp = ?,
            zipCode = ?,
            address = ?,
            detailAddress = ?,
            comment = ?,
            isDefault = ?
        where addressId = ${addressId};
    `;
  const updateAddressRow = await connection.query(updateAddressQuery,updateAddressParams);

  return updateAddressRow;
}

async function deleteAddress(connection, addressId, userId) {
  const deleteAddressQuery = `
          UPDATE MyShippingAddress
          SET 
          status = 'Y'
          WHERE 1=1
          And addressId = ${addressId}
          And userId = ${userId}
    `;
  const deleteAddressRow = await connection.query(deleteAddressQuery);

  return deleteAddressRow;
}

async function patchUserInfo(connection, userId,gender,birth,hp,openHp,email,status) {
  var genderQry = '';
  var birthQry = '';
  var hpQry = '';
  var openHpQry = '';
  var emailQry = '';
  var statusQry = `status = 'N'`;
  if(gender){
    genderQry = `, gender = '${gender}'`
  }
  if(birth){
    birthQry = `, birth = ${birth}`
  }
  if(hp){
    hpQry = `, hp = '${hp}'`
  }
  if(openHp){
    openHpQry = `, openHp = '${openHp}'`
  }
  if(gender){
    emailQry = `, email = '${email}'`
  }
  if(status){
    statusQry = `status = '${status}'`
  }
  console.log(hp)

  const patchUserInfoQuery = `
          UPDATE User
          SET 
          ${statusQry}
          ${genderQry}
          ${birthQry}
          ${hpQry}
          ${openHpQry}
          ${emailQry}
          WHERE 1=1
          And userId = ${userId}
    `;
  const patchUserInfoRow = await connection.query(patchUserInfoQuery);

  return patchUserInfoRow;
}

async function selectProfiles(connection, userId) {

  const selectUserInfoQuery = `
              SELECT 
                userId,
                marketImg,
                marketName,
                marketUrl, 
                contactStart, 
                contactEnd, 
                marketIntro, 
                policy, 
                notice 
              FROM User
              WHERE userId = ${userId};
                `;
  const [selectUserInfo] = await connection.query(selectUserInfoQuery);
  return selectUserInfo;
}

async function updateProfiles(connection, userId, updateProfileParams) {
  const updateAccountQuery = `
        UPDATE User 
        SET 
          marketName = ?,
          marketImg = ?,
          marketUrl = ?,
          contactStart = ?,
          contactEnd = ?,
          marketIntro = ?,
          policy = ?,
          notice = ?
        WHERE 1=1
        AND userId = ${userId};
    `;

  const updateAccountRow = await connection.query(updateAccountQuery,updateProfileParams);

  return updateAccountRow;
}

async function selectAccountUserId(connection, userId, accountId) {
  const selectAccountUserIdQuery = `
        select userId FROM Account
        WHERE 1=1
        AND accountId = ${accountId}
        AND userId = ${userId};
    `;

  const [selectAccountUserIdRow] = await connection.query(selectAccountUserIdQuery);
  return selectAccountUserIdRow;
}

async function selectReviewUserId(connection, userId, reviewId) {
  const selectReviewUserIdQuery = `
        select fromId as userId FROM Review
        WHERE 1=1
        AND reviewId = ${reviewId}
        AND fromId = ${userId};
    `;

  const [selectReviewUserIdRow] = await connection.query(selectReviewUserIdQuery);
  return selectReviewUserIdRow;
}

async function selectAddressUserId(connection, userId, addressId) {
  const selectAddressUserIdQuery = `
        select userId FROM MyShippingAddress
        WHERE 1=1
        AND addressId = ${addressId}
        AND userId = ${userId};
    `;

  const [selectAddressUserIdRow] = await connection.query(selectAddressUserIdQuery);
  return selectAddressUserIdRow;
}

module.exports = {
  selectUserSnsId,
  selectUserMarketName,
  insertUser,
  selectAccount,
  selectMyShippingAddress,
  selectArea,
  findFollowId,
  insertFollowers,
  selectDibs,
  selectFollowers,
  selectFeeds,
  selectFollowing,
  selectFollowRecommand,
  selectSomeProducts,
  findDibsId,
  insertDibs,
  selectReviews,
  insertReview,
  deleteReview,
  insertAccount,
  updateAccount,
  deleteAccount,
  insertArea,
  insertAddress,
  updateAddress,
  deleteAddress,
  selectUserInfo,
  patchUserInfo,
  selectMyShop,
  selectMyShopProduct,
  selectProfiles,
  updateProfiles,
  selectAccountUserId,
  selectAddressUserId,
  selectReviewUserId
};
