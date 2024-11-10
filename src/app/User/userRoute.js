module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 1.로그인
    app.post('/app/login', user.snsLogin);

    // 2.자동로그인
    app.get('/app/auto-login', jwtMiddleware, user.check);

    // 22.찜 목록 조회
    app.get('/app/dibs', jwtMiddleware, user.getDibs);

    // 23.찜 추가/삭제
    app.post('/app/dibs', jwtMiddleware, user.postDibs);

    // 28.팔로우/언팔로우
    app.post('/app/follows', jwtMiddleware, user.postFollowers);

    // 29.팔로워 조회
    app.get('/app/follows/followers', jwtMiddleware, user.getFollowers);

    // 30.팔로잉 조회
    app.get('/app/follows/following', jwtMiddleware, user.getFollowing);

    // 31.팔로잉 피드 조회
    app.get('/app/follows/feeds', jwtMiddleware, user.getFeeds);

    // 32.팔로잉 추천 조회
    app.get('/app/follows/recommand', jwtMiddleware, user.getFollowRecommand);

    // 33.마이샵 조회
    app.get('/app/shops', jwtMiddleware, user.getMyShop);

    // 34.내상점 정보 조회
    app.get('/app/profiles', jwtMiddleware, user.getProfiles);

    // 35.내상점 정보 수정
    app.put('/app/profiles', jwtMiddleware, user.putProfiles);

    // 36.내 프로필 조회
    app.get('/app/users', jwtMiddleware, user.getUserInfo);
  
    // 37.내 프로필 수정
    app.patch('/app/users', jwtMiddleware, user.patchUserInfo);

    // 38.내 배송지 조회
    app.get('/app/address', jwtMiddleware, user.getMyShippingAddress);

    // 39.내 배송지 추가
    app.post('/app/address', jwtMiddleware, user.postMyShippingAddress);

    // 40.내 배송지 수정
    app.put('/app/address/:addressId', jwtMiddleware, user.putMyShippingAddress);

    // 41.내 배송지 삭제
    app.patch('/app/address/:addressId', jwtMiddleware, user.patchMyShippingAddress);

    // 42.계좌 조회
    app.get('/app/accounts', jwtMiddleware, user.getAccounts);

    // 43.계좌 추가
    app.post('/app/accounts', jwtMiddleware, user.postAccounts);

    // 44.계좌 수정
    app.put('/app/accounts/:accountId', jwtMiddleware, user.putAccount);

    // 45.계좌 삭제
    app.patch('/app/accounts/:accountId', jwtMiddleware, user.patchAccount);

    // 46.지역설정 조회
    app.get('/app/areas', jwtMiddleware, user.getArea);

    // 47.지역설정 추가
    app.post('/app/areas', jwtMiddleware, user.postArea);

    // 48.상점 후기 조회
    app.get('/app/users/:userId/reviews', jwtMiddleware, user.getReviews);

    // 49.상점 후기 작성
    app.post('/app/users/:userId/reviews', jwtMiddleware, user.postReviews);

    // 50.상점 후기 삭제
    app.patch('/app/users/:userId/reviews/:reviewId', jwtMiddleware, user.patchReviews);

    


};
