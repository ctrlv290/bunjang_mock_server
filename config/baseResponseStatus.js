module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" }, // ?

    //Request error
    ACCESS_TOKEN_EMPTY : { "isSuccess": false, "code": 2001, "message":"Access Token이 누락되었습니다." },
    SNS_TYPE_EMPTY : { "isSuccess": false, "code": 2002, "message":"SNS TYPE이 누락되었습니다." },

    USER_ID_EMPTY : { "isSuccess": false, "code": 2003, "message":"유저ID가 누락되었습니다." },
    PRODUCT_NAME_EMPTY : { "isSuccess": false, "code": 2004, "message": "상품명을 입력 해주세요" },
    PRODUCT_IMG_LENGTH_MINIMUM : { "isSuccess": false, "code": 2005, "message":"상품 사진을 1개이상 등록해주세요" },
    CATEGORY_EMPTY : { "isSuccess": false, "code": 2006, "message":"카테고리를 선택해주세요" },
    PRICE_EMPTY : { "isSuccess": false,"code": 2007,"message":"가격을 입력해주세요" },
    PRICE_MINIMUM : { "isSuccess": false,"code": 2008,"message":"100원 이상 입력해주세요"},

    SHIPPING_ADDRESS_EMPTY : { "isSuccess": false, "code": 2009, "message":"배송지 정보를 입력해주세요." },
    SELLER_ID_EMPTY : { "isSuccess": false, "code": 2010, "message":"판매자 ID가 누락되었습니다." },
    PRODUCT_ID_EMPTY : { "isSuccess": false, "code": 2011, "message": "상품 ID가 누락되었습니다." },
    PAYMENT_EMPTY : { "isSuccess": false, "code": 2012, "message": "결제타입이 누락되었습니다." },
    FEES_EMPTY : { "isSuccess": false, "code": 2013, "message": "수수료를 입력해주세요." },
    DEAL_TYPE_EMPTY : { "isSuccess": false, "code": 2014, "message": "거래타입이 누락되었습니다." },
    SHIPPING_FEES_EMPTY : { "isSuccess": false, "code": 2015, "message": "배송비 포함 여부를 입력해주세요." },



    CONTENT_EMPTY : { "isSuccess": false, "code": 2016, "message": "내용을 입력해주세요." },
    CONTENT_LENGTH_100 : { "isSuccess": false, "code": 2017, "message": "내용을 100글자 이하로 입력해주세요." },
    CONTENT_LENGTH_1000 : { "isSuccess": false, "code": 2035, "message": "내용을 1000글자 이하로 입력해주세요." },
    
    LENGTH_MINIMUM : { "isSuccess": false, "code": 2018, "message": "1개이상 선택해주세요." },

    PRODUCT_NAME_LENGTH : { "isSuccess": false, "code": 2019, "message": "상품명을 100글자 이하로 입력해주세요." },
    PRODUCT_IMG_LENGTH_MINIMUM : { "isSuccess": false, "code": 2020, "message":"상품 사진은 12개까지 등록가능합니다." },
    PRODUCT_DESCRIPTION_LENGTH : { "isSuccess": false, "code": 2021, "message":"상품 설명을 2000글자 이하로 입력해주세요." },
    PAGE_ONLY_NUMBER : { "isSuccess": false, "code": 2022, "message":"페이지는 숫자만 입력해주세요." },
    GRADE_EMPTY : { "isSuccess": false, "code": 2023, "message": "평점이 누락되었습니다." },
    CONTENT_LENGTH_MINIMUM_20 : { "isSuccess": false, "code": 2024, "message": "최소 20글자 이상 입력해주세요." },
    ACCOUNT_IS_NOT_NUMBER : { "isSuccess": false, "code": 2025, "message":"계좌번호는 숫자만 입력해주세요." },
    BANK_NAME_EMPTY : { "isSuccess": false, "code": 2026, "message": "은행이름이 누락되었습니다." },
    ACCOUNT_NUM_EMPTY : { "isSuccess": false, "code": 2027, "message": "계좌번호가 누락되었습니다." },
    ACCOUNT_HOLDER_EMPTY : { "isSuccess": false, "code": 2028, "message":"예금주 이름이 누락되었습니다." },
    ACCOUNT_NUM_USED : { "isSuccess": false, "code": 2028, "message":"이미 등록된 계좌입니다." },
    AREA_NAME_EMPTY : { "isSuccess": false, "code": 2029, "message": "지역명이 누락되었습니다." },
    AREA_RANGE_EMPTY : { "isSuccess": false, "code": 2030, "message": "지역범위가 누락되었습니다" },
    AREA_CERTIFICATE_EMPTY : { "isSuccess": false, "code": 2031, "message":"지역범위는 숫자만 입력해주세요." },
    AREA_RANGE_ONLY_NUMBER : { "isSuccess": false, "code": 2032, "message":"이미 등록된 계좌입니다." },
    EMAIL_WRONG : { "isSuccess": false, "code": 2033, "message":"이메일 형식이 올바르지 않습니다." },
    HP_ONLY_NUMBER : { "isSuccess": false, "code": 2034, "message":"휴대전화는 숫자만 입력해주세요." },
    TYPE_EMPTY: { "isSuccess": false, "code": 2035, "message":"type이 누락되었거나 잘못 입력되었습니다." },
    STATUS_EMPTY : { "isSuccess": false, "code": 2036, "message":"status가 누락되었거나 잘못 입력되었습니다." },

    // Response error
    SIGNUP_REDUNDANT_EMAIL : { "isSuccess": false, "code": 3001, "message":"중복된 이메일입니다." },
    SIGNUP_REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"중복된 닉네임입니다." },
    NOT_JOIN_CHATROOM : { "isSuccess": false, "code": 3003, "message":"참여중인 채팅방이 아닙니다." },
    NOT_MY_PRODUCT : { "isSuccess": false, "code": 3004, "message":"내 상품이 아닙니다." },
    NOT_MY_INFO : { "isSuccess": false, "code": 3005, "message":"내 정보가 아닙니다." },
    NOT_MY_CONTENT : { "isSuccess": false, "code": 3006, "message":"내가 작성한 글이 아닙니다." },

    SIGNIN_EMAIL_WRONG : { "isSuccess": false, "code": 3003, "message": "아이디가 잘못 되었습니다." },
    SIGNIN_PASSWORD_WRONG : { "isSuccess": false, "code": 3004, "message": "비밀번호가 잘못 되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3005, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3006, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
 
 
}
