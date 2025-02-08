Page({
    data: {
      list: [],
      loading: false,
      page: 1,
      pageSize: 10,
      hasMore: true
    },
  
    onLoad() {
      this.loadData(true); // 初始化加载
    },
  
    // 新增下拉刷新处理
    onPullDownRefresh() {
      this.loadData(true); // 强制刷新
    },
  
    async loadData(forceRefresh = false) {
      if (this.data.loading || (!forceRefresh && !this.data.hasMore)) return;
  
      // 重置参数（强制刷新时）
      if (forceRefresh) {
        this.setData({
          page: 1,
          list: [],
          hasMore: true
        });
      }
  
      this.setData({ loading: true });
  
      try {
        const res = await wx.cloud.callFunction({
          name: 'ch',
          data: {
            status: 'pending', // 确保只请求待处理状态
            page: this.data.page,
            pageSize: this.data.pageSize
          }
        });
  
        const newList = res.result.data;
        this.setData({
          list: forceRefresh ? newList : [...this.data.list, ...newList],
          hasMore: newList.length >= this.data.pageSize,
          page: this.data.page + 1,
          loading: false
        });
        
        // 停止下拉刷新动画
        if (forceRefresh) wx.stopPullDownRefresh();
      } catch (error) {
        console.error('加载失败', error);
        this.setData({ loading: false });
        if (forceRefresh) wx.stopPullDownRefresh();
      }
    },
  
    onReachBottom() {
      this.loadData(); // 常规分页加载
    },
  
    // 跳转到详情页面（保持原有逻辑）
    navigateToDetail(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/check1/check1?id=${id}`,
        success: (res) => {
          // 监听页面返回事件
          res.eventChannel.once('reviewCompleted', () => {
            this.loadData(true); // 审核完成后强制刷新
          });
        }
      });
    },
  
    formatTime(time) { /* 保持原有逻辑 */ }
  });