// cloudfunctions/loginCheck/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 解密手机号
const decryptPhone = async (encryptedData, iv, code) => {
  const { data: { session_key } } = await cloud.getSessionKey({ code })
  try {
    return cloud.getWXContext().decryptPhoneNumber({
      encryptedData,
      iv,
      sessionKey: session_key
    })
  } catch (err) {
    throw new Error('手机号解密失败')
  }
}

exports.main = async (event) => {
  const { encryptedData, iv, code } = event
  
  try {
    // 1. 解密获取手机号
    const { phoneNumber } = await decryptPhone(encryptedData, iv, code)
    
    // 2. 检查管理员表
    const adminRes = await db.collection('admis')
      .where({ phone: phoneNumber })
      .count()
    
    if (adminRes.total > 0) {
      return { status: 'admin', phone: phoneNumber }
    }

    // 3. 检查申请记录
    const applyRes = await db.collection('applydatabase')
      .where({ phone: phoneNumber })
      .get()

    if (applyRes.data.length === 0) {
      return { status: 'not_registered', phone: phoneNumber }
    }

    // 4. 返回申请状态
    const latestApply = applyRes.data[0] // 取最新记录
    return { 
      status: latestApply.status || 'pending',
      phone: phoneNumber
    }
    
  } catch (err) {
    console.error('登录检查失败:', err)
    return { status: 'error', message: err.message }
  }
}