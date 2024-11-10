module.exports = function(app){
    const product = require('./productController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 3.상품 목록 조회
    app.get('/app/products',jwtMiddleware, product.getProducts);

    // 4.상품 추가
    app.post('/app/products', jwtMiddleware, product.postProducts);

    // 5.특정 상품 조회
    app.get('/app/products/:productId',jwtMiddleware, product.getProductId);

    // 6.상품 정보 수정
    app.put('/app/products/:productId',jwtMiddleware, product.putProductId);

    // 7.상품삭제 / 상태변경
    app.patch('/app/products/:productId',jwtMiddleware, product.patchProductId);

    // 8.문의글 조회
    app.get('/app/products/:productId/questions', jwtMiddleware, product.getQuestions);

    // 9.문의글 등록
    app.post('/app/products/:productId/questions', jwtMiddleware, product.postQuestions);

    // 10.문의글 삭제
    app.patch('/app/products/:productId/questions/:questionId', jwtMiddleware, product.patchQuestions);

    // 12.찜한사람 조회
    app.get('/app/products/:productId/dibs', jwtMiddleware, product.getDibsUsers);

    // 13.카테고리 대분류 조회
    app.get('/app/categorys-g', jwtMiddleware, product.getCategoryG);

    // 14.카테고리 중분류 조회
    app.get('/app/categorys-g/:categoryGId', jwtMiddleware, product.getCategoryM);

    // 15.카테고리 소분류 조회
    app.get('/app/categorys-m/:categoryMId', jwtMiddleware, product.getCategoryS);

    // 25.최근 본 상품 조회
    app.get('/app/lately-products',jwtMiddleware, product.getLatelyProducts);

    // 26.최근 본 상품 삭제
    app.patch('/app/lately-products',jwtMiddleware, product.patchLatelyProducts);

};