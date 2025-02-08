// cloudfunctions/reviewApplication/index.js
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event) => {
  const { id, status } = event
  const db = cloud.database()
  const wxContext = cloud.getWXContext()



  // 更新申请状态
  try {
    // 更新申请状态
    await db.collection('applydatabase').doc(id).update({
        data: {
            status,
            reviewer: wxContext.OPENID,
            reviewTime: db.serverDate()
        }
    });
    return {
        code: 0,
        message: '更新成功',
        status
    };
} catch (error) {
    console.error('更新失败:', error);
    return {
        code: 1,
        message: '更新失败',
        error: error.message // 返回错误信息
    };
}
};