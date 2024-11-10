const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

exports.snsIdCheck = async function (snsType,snsId) {
  var snsIdcol;
  if(snsType == 'kakao'){
    snsIdcol = 'kakaoId'
  }
  else if(snsType == 'naver') {
    snsIdcol = 'naverId'
  }
  else if(snsType == 'facebook') {
    snsIdcol = 'facebookId'
  }
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserSnsId(connection, snsIdcol, snsId);
  connection.release();

  return userAccountResult;
};

exports.marketNameCheck = async function (marketName) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectMarketNameResult = await userDao.selectUserMarketName(connection, marketName);
  connection.release();

  return selectMarketNameResult;
};

exports.findMyshop = async function (userId, type) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectMyShopResult = await userDao.selectMyShop(connection, userId, type);
  connection.release();

  return selectMyShopResult;
};

exports.findMyshopProduct = async function (userId, type, orderby, page) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectMyShopProductResult = await userDao.selectMyShopProduct(connection, userId, type, orderby, page);
  connection.release();

  return selectMyShopProductResult;
};

exports.findAccounts = async function (userId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectAccountResult = await userDao.selectAccount(connection, userId);
  connection.release();

  return selectAccountResult;
};

exports.findAccountUserId = async function (userId, accountId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectAccountUserIdResult = await userDao.selectAccountUserId(connection, userId, accountId);
  connection.release();
  return selectAccountUserIdResult[0];
};

exports.findReviewUserId = async function (userId, reviewId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectReviewUserIdResult = await userDao.selectReviewUserId(connection, userId, reviewId);
  connection.release();
  return selectReviewUserIdResult[0];
};



exports.findProfiles = async function (userId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectProfilesResult = await userDao.selectProfiles(connection, userId);
  connection.release();

  return selectProfilesResult;
};

exports.findUserInfo = async function (userId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoResult = await userDao.selectUserInfo(connection, userId);
  connection.release();

  return selectUserInfoResult;
};


exports.findMyShippingAddress = async function (userId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectMyShippingAddressResult = await userDao.selectMyShippingAddress(connection, userId);
  connection.release();

  return selectMyShippingAddressResult;
};

exports.findAddressUserId = async function (userId, addressId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectAddressUserIdResult = await userDao.selectAddressUserId(connection, userId, addressId);
  connection.release();
  return selectAddressUserIdResult[0];
};

exports.findArea = async function (userId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectAreaResult = await userDao.selectArea(connection, userId);
  connection.release();

  return selectAreaResult;
};

exports.findReviews = async function (sellerId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectReviewsResult = await userDao.selectReviews(connection, sellerId);
  connection.release();

  return selectReviewsResult;
};


exports.findDibs = async function (userId, page) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectDibsResult = await userDao.selectDibs(connection, userId, page);
  connection.release();

  return selectDibsResult;
};

exports.findFollowers = async function (userId, page) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectFollowersResult = await userDao.selectFollowers(connection, userId, page);
  connection.release();

  return selectFollowersResult;
};

exports.findFeeds = async function (userId, page) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectFeedsResult = await userDao.selectFeeds(connection, userId, page);
  connection.release();

  return selectFeedsResult;
};

exports.findFollowing = async function (userId, page) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectFollowingResult = await userDao.selectFollowing(connection, userId, page);
  if(selectFollowingResult.length != 0){
      for(i=0;selectFollowingResult.length > i; i++){
      const selectSomeProductsResult = await userDao.selectSomeProducts(connection, selectFollowingResult[i].sellerId);
      selectFollowingResult[i].products = selectSomeProductsResult;
      }
  }

  connection.release();

  return selectFollowingResult;
};

exports.findFollowRecommand = async function (userId, page) {

  const connection = await pool.getConnection(async (conn) => conn);
  const selectFollowRecommandResult = await userDao.selectFollowRecommand(connection, userId, page);
  if(selectFollowRecommandResult.length != 0){
      for(i=0;selectFollowRecommandResult.length > i; i++){
      const selectSomeProductsResult = await userDao.selectSomeProducts(connection, selectFollowRecommandResult[i].sellerId);
      selectFollowRecommandResult[i].products = selectSomeProductsResult;
      }
  }

  connection.release();
  return selectFollowRecommandResult;
};
