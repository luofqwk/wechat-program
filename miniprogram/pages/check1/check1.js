// pages/review-detail/review-detail.js
Page({
    data: {
    detail: null, // 详细信息
    idCardUrls: [], // 身份证照片临时 URL
    workCardUrls: [] // 工作证照片临时 URL
    },
    onLoad(options) {
      const id = options.id; // 获取 URL 参数中的 _id
      console.log('跳转成功',id);
      this.loadDetail(id); // 加载详细信息
    },
    
    // 加载详细信息
    async loadDetail(id) {
        wx.showLoading({ title: '加载中' });
      
        try {
          const res = await wx.cloud.callFunction({
            name: 'ch2',
            data: { id }
          });
      
          console.log('云函数返回数据:', res); // 打印云函数返回数据
      
          // 检查返回数据格式
          if (res.result && res.result.code === 0) {
            this.setData({
              detail: res.result.data,
              idCardUrls: res.result.data.idCardPhotos|| [], // 默认值为空数组
              workCardUrls: res.result.data.workCardPhotos || [] // 默认值为空数组
            });
          } else {
            console.error('云函数返回数据格式错误:', res);
            wx.showToast({ title: '数据加载失败', icon: 'none' });
          }
          console.log('详细信息:', this.data.idCardUrls);

        } catch (error) {
          console.error('加载失败', error);
          wx.showToast({ title: '加载失败', icon: 'none' });
        } finally {
          wx.hideLoading(); // 确保 hideLoading 被调用
        }
      },
    
    // 图片预览
    previewImage(e) {
        const url = e.currentTarget.dataset.url; // 获取当前点击的图片 URL
        console.log('预预览的照片路径:', url); // 打印云函数返回数据
        wx.previewImage({
            urls: [url] // 预览单张图片
        });
    },
    
    // 审核操作
    async handleReview(e) {
      const status = e.currentTarget.dataset.status;
 
      wx.showLoading({ title: '处理中' });
    
      try {
        const res = await wx.cloud.callFunction({
          name: 'ch3',
          data: {
            id: this.data.detail._id,
            status
          }
        });
        if (res.result.code === 0) {
            console.log('更新后的状态:', res.result.status); // 打印更新后的状态
            wx.showToast({ title: '操作成功' });
        } else {
            console.error('返回的错误信息:', res.result.message); // 打印返回的错误信息
        }
      // 通过事件通道通知列表页刷新
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.emit('reviewCompleted');
        wx.navigateBack(); // 返回上一页
        wx.showToast({ title: '操作成功' });
      } catch (error) {
        wx.showToast({ title: '操作失败', icon: 'none' });
      } finally {
        wx.hideLoading();
      }
    }
    });