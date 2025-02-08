// cloudfunctions/getApplications/index.js
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event) => {
  const { status, page = 1, pageSize = 10 } = event
  const db = cloud.database()
  
  return db.collection('applydatabase')
    .where({ status: 'pending'  })
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
}