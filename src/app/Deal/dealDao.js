async function insertDeal(connection, insertDealParams) {
    const insertDealQuery = `
          INSERT INTO Deal(
              buyerId, 
              sellerId, 
              productId, 
              dealType, 
              payment, 
              price, 
              fees, 
              shippingFee,
              status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
    const insertDealRow = await connection.query(insertDealQuery,insertDealParams);
  
    return insertDealRow;
}

async function insertShippingAddress(connection, insertAddressParams) {
    const insertShippingAddressQuery = `
          INSERT INTO ShippingAddress(
                dealId,
                receiveName,
                receiveHp,
                zipCode,
                address,
                detailAddress,
                comment)
          VALUES (?, ?, ?, ?, ?, ?, ?);
      `;
    const insertShippingAddressRow = await connection.query(insertShippingAddressQuery,insertAddressParams);
  
    return insertShippingAddressRow;
}

async function findChatRoomId(connection, userId, sellerId) {
    const selectChatRoomIdQuery = `
                SELECT chatroomId
                FROM ChatRoom
                WHERE 1=1
                And status = 'N'
                And (sellerId = ${sellerId} And buyerId = ${userId})
                OR (sellerId = ${userId} And buyerId = ${sellerId});
                ;
                  `;
    const selectChatRoomIdRows = await connection.query(selectChatRoomIdQuery);
    console.log(selectChatRoomIdQuery)
    console.log(selectChatRoomIdRows)
    return selectChatRoomIdRows[0];
}

async function insertChatRoom(connection, userId, sellerId, productId, dealId) {
    const insertChatRoomQuery = `
          INSERT INTO ChatRoom(
                sellerId,
                buyerId,
                productId,
                dealId)
          VALUES (${sellerId}, ${userId}, ${productId}, ${dealId});
      `;
    const insertChatRoomRow = await connection.query(insertChatRoomQuery);
  
    return insertChatRoomRow;
}

async function updateChatRoomChangeDealId(connection, chatroomId, dealId) {
    const updateChatRoomChangeDealIdQuery = `
            UPDATE ChatRoom
            SET dealId =  ${dealId}
            WHERE chatRoomId = ${chatroomId};
    `;
    const updateChatRoomChangeDealIdRow = await connection.query(updateChatRoomChangeDealIdQuery);
  
    return updateChatRoomChangeDealIdRow;
}

async function updateChatRoomChangeUserId(connection, chatroomId, buyerId, sellerId ,productId) {
    if(productId == null){
        productId = 0;
    }
    const updateChatRoomChangeUserIdQuery = `
            UPDATE ChatRoom
            SET sellerId =  ${sellerId},
            buyerId = ${buyerId},
            productId =${productId}
            WHERE chatRoomId = ${chatroomId};
    `;
    const updateChatRoomChangeUserIdRow = await connection.query(updateChatRoomChangeUserIdQuery);
  
    return updateChatRoomChangeUserIdRow;
}


async function insertMyChatRoom(connection, chatroomId, userId) {
    const insertMyChatRoomQuery = `
          INSERT INTO MyChatRoom(
                chatRoomId,
                userId)
          VALUES (${chatroomId}, ${userId});
      `;
    const insertMyChatRoomRow = await connection.query(insertMyChatRoomQuery);
  
    return insertMyChatRoomRow;
}

async function insertMessage(connection, chatRoomId, sendUserId, receiveUserId, message, messageType, dealId) {
    if(dealId == null){
        dealId = 0
    }
    if(messageType == null){
        messageType = 0
    }
    const insertMessageQuery = `
          INSERT INTO Message(
                chatRoomId,
                sendUserId,
                receiveUserId,
                message,
                messageType,
                dealId
                )
          VALUES (
                ${chatRoomId}, 
                ${sendUserId}, 
                ${receiveUserId}, 
                '${message}', 
                ${messageType},
                ${dealId}
                );
      `;
    const insertMessageRow = await connection.query(insertMessageQuery);
  
    return insertMessageRow;
}

async function selectMyChatRooms(connection, userId) {
    const selectMyChatRoomsQuery = `
                SELECT 
                    CR.chatroomId, MCR.notification,
                    CR.receiveUserId,
                    U.marketName, U.marketImg,
                    CASE 
                        WHEN MI.createdAt > CURDATE()
                            THEN 
                                CASE WHEN LEFT(DATE_FORMAT(MI.createdAt,'%p %l:%i'),2) = 'PM' 
                                THEN CONCAT('오후 ',DATE_FORMAT(MI.createdAt,'%l:%i'))
                                ELSE CONCAT('오전 ',DATE_FORMAT(MI.createdAt,'%l:%i')) END
                        ELSE DATE_FORMAT(MI.createdAt,'%c.%e')
                    End AS sendDate, 
                     MI.message as lastMessage, MI.sendUserID as lastSendId,
                    IFNULL(MC.notReadCnt,0) as notReadCnt
                FROM MyChatRoom MCR
                LEFT JOIN (
                    SELECT
                        chatRoomId,
                        productId,
                        CASE 
                            WHEN sellerId = ${userId} then buyerId
                            ELSE sellerId 
                        END AS receiveUserId
                    FROM ChatRoom CR
                ) CR ON MCR.chatRoomId = CR.chatRoomId
                LEFT JOIN User U ON CR.receiveUserId = U.userId
                LEFT JOIN (
                    SELECT chatRoomId, createdAt, message, sendUserId from Message 
                    WHERE (chatRoomId, createdAt) IN(SELECT chatRoomId,max(createdAt) 
                    FROM Message group by chatRoomId)
                )MI ON MI.chatRoomId = CR.chatRoomId
                LEFT JOIN (
                    SELECT chatRoomId,
                        count(case when toRead = 'N' then 1 end) as notReadCnt
                    FROM Message
                    WHERE receiveUserId = ${userId}
                    GROUP BY chatRoomId
                ) MC ON MC.chatRoomId = MCR.chatRoomId
                WHERE 1=1 
                AND MI.message is not null
                AND MCR.status = 'N'
                AND MCR.userId = ${userId}
                ORDER BY MI.createdAt desc;
                  `;
                  console.log(selectMyChatRoomsQuery)
    const [selectMyChatRoomsRows] = await connection.query(selectMyChatRoomsQuery);
    return selectMyChatRoomsRows;
}

async function selectDeals(connection, userId, type , status) {
    var joinUserQry = '';
    var whereUserQry = '';
    var whereStatusQry = '';

    if(type == 1){
        joinUserQry = 'D.sellerId'
        whereUserQry = 'D.buyerId'
    }else if(type == 2){
        joinUserQry = 'D.buyerId'
        whereUserQry = 'D.sellerId'
    }

    if(status == 0){
        //전체
        whereStatusQry = 'D.status != 0'
    }else if(status == 1){
        //진행중
        whereStatusQry = 'D.status = 1 OR D.status = 3'
    }else if(status == 2){
        //완료
        whereStatusQry = 'D.status = 5'
    }else if(status == 3){
        //환불 취소
        whereStatusQry = 'D.status = 2 OR D.status = 4 OR D.status = 6'
    }

    const selectDealsQuery = `
    SELECT 
        D.dealId, 
        CASE WHEN D.status = 1 THEN '결제완료'
                WHEN D.status =2 THEN '환불완료'
                WHEN D.status =3 THEN '합의완료'
                WHEN D.status =4 THEN '합의취소'
                WHEN D.status =5 THEN '거래완료'
                WHEN D.status =6 THEN '거래취소'
        END AS dealStatus,
        P.productName, 
        PI.productImg,
        D.price + fees AS price, 
        CASE WHEN D.dealType = 1 OR D.dealType = 2 THEN CONCAT(U.marketName,' / 번개페이')
            ELSE U.marketName
        END AS nameAndPay,
        CASE WHEN LEFT(DATE_FORMAT(D.updatedAt,'%p'),2) = 'PM' 
            THEN CONCAT(DATE_FORMAT(D.updatedAt,'%Y.%m.%d'), ' (오후 ',DATE_FORMAT(D.updatedAt,'%l:%i'),')')
            ELSE CONCAT('오전 ',DATE_FORMAT(D.updatedAt,'%l:%i'))
        End AS dealDate
    FROM Deal D
    LEFT JOIN Product P ON P.productId = D.productId
    LEFT JOIN ProductImage PI ON D.productId = PI.productId AND PI.status = 'N' AND PI.num = 1
    LEFT JOIN User U ON ${joinUserQry} = U.userId
    WHERE 1=1
    AND ${whereUserQry} = ${userId}
    AND ${whereStatusQry}
                  `;
    const [selectDealsRows] = await connection.query(selectDealsQuery);
    return selectDealsRows;
}

async function selectChatRoomIdInfo(connection,chatroomId,userId) {
    const selectChatRoomIdInfoQuery = `
    SELECT 
        CR.chatRoomId, 
        CR.productId,
        PI.productImg,
        CASE WHEN P.negotiation = 'Y' THEN '연락요망'
        ELSE CONCAT(FORMAT(P.price,0),'원') 
        END AS price,
        P.productName,
        CASE WHEN sellerId = ${userId} THEN 1 ELSE 2 END AS myStatus
    FROM ChatRoom CR
    LEFT JOIN Product P ON P.productId = CR.productId
    LEFT JOIN ProductImage PI ON PI.productId = CR.productId AND PI.status ='N' AND num = 1
    WHERE chatRoomId = ${chatroomId};
                  `;
    const [selectChatRoomIdInfoRows] = await connection.query(selectChatRoomIdInfoQuery);
    return selectChatRoomIdInfoRows;
}

async function selectChatRoomIdMessage(connection, chatroomId, userId) {
    const selectChatRoomIdMessageQuery = `
        SELECT 
            M.sendUserId,
            CASE WHEN toRead = 'Y'
                THEN '' ELSE '안읽음' 
            END AS toRead,
            message,
            CASE WHEN LEFT(DATE_FORMAT(M.createdAt,'%p %l:%i'),2) = 'PM' 
                THEN CONCAT('오후 ',DATE_FORMAT(M.createdAt,'%l:%i'))
                ELSE CONCAT('오전 ',DATE_FORMAT(M.createdAt,'%l:%i')) 
            END AS sendTime,
	        DATE_FORMAT(M.createdAt,'%Y.%m.%d') AS sendDate,
            messageType,
            dealId,
            CASE WHEN sendUserId = ${userId} THEN ''
                ELSE IFNULL(U.marketImg,'') 
            END marketImg
        FROM Message M
        LEFT JOIN MyChatRoom MCR ON MCR.chatRoomId = M.chatRoomId AND MCR.status ='N' AND MCR.userId = ${userId}
        LEFT JOIN User U ON U.userId = M.sendUserId
        WHERE 1=1
            AND M.chatRoomId = ${chatroomId}
            AND M.status = 'N'
            AND MCR.createdAt <= M.createdAt
        ORDER BY messageId asc
        ;
                  `;
    const [selectChatRoomIdMessageRows] = await connection.query(selectChatRoomIdMessageQuery);
    return selectChatRoomIdMessageRows;
}

async function updateMessageToRead(connection, chatroomId, userId) {
    const updateMessageToReadQuery = `
        UPDATE Message SET toRead = 'Y'
        WHERE receiveUserId = ${userId}
        AND toRead = 'N'
        AND chatRoomId = ${chatroomId}
        ;
                  `;
    const [updateMessageToReadRows] = await connection.query(updateMessageToReadQuery);
    return updateMessageToReadRows;
}

async function checkJoinChatRoomId(connection,chatroomId, userId) {
    const checkJoinChatRoomIdQuery = `
    SELECT chatRoomId FROM ChatRoom 
    WHERE 1=1
    AND chatRoomId = ${chatroomId} 
    AND (sellerId = ${userId} 
        OR buyerId = ${userId}) 
    ;
                  `;
    const [checkJoinChatRoomIdRows] = await connection.query(checkJoinChatRoomIdQuery);
    return checkJoinChatRoomIdRows;
}

async function selectChatRoomUserId(connection, chatroomId, userId) {
    const selectChatRoomUserIdQuery = `
    SELECT 
        CASE WHEN sellerId = ${userId} Then buyerId
        ELSE sellerId END AS recevieUserId 
    FROM ChatRoom WHERE chatroomId = ${chatroomId};
                  `;
    const [selectChatRoomUserIdRows] = await connection.query(selectChatRoomUserIdQuery);
    return selectChatRoomUserIdRows;
}

async function findMyChatRoomId(connection,chatroomId, userId) {
    const findMyChatRoomIdQuery = `
    SELECT myChatId FROM MyChatRoom 
    WHERE 1=1
    AND chatRoomId = ${chatroomId} 
    AND userId = ${userId} 
    AND status = 'N'
    ;
                  `;
    const [findMyChatRoomIdRows] = await connection.query(findMyChatRoomIdQuery);
    return findMyChatRoomIdRows;
}

async function deleteMyChatRoom(connection, myChatId, userId) {
    const deleteMyChatRoomQuery = `
    UPDATE MyChatRoom SET status = 'Y'
    WHERE myChatId = ${myChatId} AND userId = ${userId}
    ;
    `;
    const [deleteMyChatRoomRows] = await connection.query(deleteMyChatRoomQuery);
    return deleteMyChatRoomRows;
}

module.exports = {
    insertDeal,
    selectDeals,
    insertShippingAddress,
    findChatRoomId,
    insertChatRoom,
    updateChatRoomChangeDealId,
    insertMyChatRoom,
    insertMessage,
    selectMyChatRooms,
    updateChatRoomChangeUserId,
    selectChatRoomIdInfo,
    selectChatRoomIdMessage,
    updateMessageToRead,
    checkJoinChatRoomId,
    selectChatRoomUserId,
    findMyChatRoomId,
    deleteMyChatRoom
  };