module.exports = function(app){
    const deal = require('./dealController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    // 16.대화방 목록 조회
    app.get('/app/chatrooms',jwtMiddleware, deal.getMyChatRooms);

    // 17.대화방 생성 - 번개톡 시작
    app.post('/app/chatrooms',jwtMiddleware, deal.postMyChatRooms);

    // 18.특정 대화방 조회
    app.get('/app/chatrooms/:chatroomId',jwtMiddleware, deal.getChatId);

    // 19. 대화 보내기(일반 메세지)
    app.post('/app/chatrooms/:chatroomId',jwtMiddleware, deal.postMessage);

    // 20. 대화방 나가기 
    app.patch('/app/chatrooms/:chatroomId',jwtMiddleware, deal.patchMyChatRoom);
    
    // 21.거래 생성
    app.post('/app/deals', jwtMiddleware, deal.postDeals);

    // 22.거래 내역 조회
    app.get('/app/deals', jwtMiddleware, deal.getDeals);

};