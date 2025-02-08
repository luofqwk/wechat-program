// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    const db = cloud.database()
    const result = await db.collection('applydatabase').add({
      data: {
        ...event,
        _id: `${Date.now()}-${Math.floor(Math.random() * 1000000)}`, // 自定义ID
        createTime: db.serverDate(), // 使用服务器时间
        updateTime: db.serverDate(),
        status: 'pending'
      }
    })
    
    return {
      code: 0,
      data: result,
      message: '提交成功'
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message
    }
  }
}