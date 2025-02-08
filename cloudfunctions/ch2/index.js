const cloud = require('wx-server-sdk'); // 引入云模块
cloud.init(); // 初始化

exports.main = async (event) => {
    const { id } = event;
    const db = cloud.database(); // 创建数据库引用

    try {
        // 校验 ID 格式
        if (!id || typeof id !== 'string') {
            return { code: 400, message: '无效的 ID 参数' };
        }

        // 查询数据库
        const res = await db.collection('applydatabase').doc(id).get();
        console.log('数据库查询结果:', res);

        if (!res.data) {
            return { code: 404, message: '数据不存在' };
        }

        console.log('获取的数据:', res.data);

        // 处理文件 ID
        const idCardFileIDs = Array.isArray(res.data.idCardFileIDs) ? res.data.idCardFileIDs : [];
        const workCardFileIDs = Array.isArray(res.data.workCardFileIDs) ? res.data.workCardFileIDs : [];

        // 获取临时 URL
        let idCardUrls = [];
        let workCardUrls = [];

        if (idCardFileIDs.length > 0) {
            const idCardRes = await cloud.getTempFileURL({ fileList: idCardFileIDs });
            idCardUrls = idCardRes.fileList.map(file => file.tempFileURL);
        }

        if (workCardFileIDs.length > 0) {
            const workCardRes = await cloud.getTempFileURL({ fileList: workCardFileIDs });
            workCardUrls = workCardRes.fileList.map(file => file.tempFileURL);
        }

        return {
            code: 0,
            data: {
                ...res.data,
                idCardUrls,
                workCardUrls
            }
        };
    } catch (error) {
        console.error('云函数错误:', error);
        return { code: 500, message: '服务器内部错误' };
    }
};