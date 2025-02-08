Page({
    getPhoneNumber(e) {
      if (e.detail.errMsg === 'getPhoneNumber:ok') {
        wx.showLoading({ title: '登录中...' })
        const { encryptedData, iv } = e.detail
  
        // 1. 获取微信登录code
        wx.login({
          success: async (loginRes) => {
            try {
              // 2. 调用云函数解密手机号并验证
              const res = await wx.cloud.callFunction({
                name: 'loginCheck',
                data: {
                  code: loginRes.code,
                  encryptedData,
                  iv
                }
              })
  
              wx.hideLoading()
  
              // 3. 处理登录结果
              switch (res.result.status) {
                case 'admin':
                  wx.reLaunch({ url: '/pages/check/check' })
                  break
                case 'approved':
                  wx.showToast({ title: '审核已通过' })
                  // 跳转到用户主页
                  break
                case 'pending':
                  wx.showToast({ title: '审核中，请耐心等待', icon: 'none' })
                  break
                case 'rejected':
                  wx.showToast({ title: '审核未通过，请联系管理员', icon: 'none' })
                  break
                case 'not_registered':
                  wx.showModal({
                    title: '提示',
                    content: '您尚未注册，是否立即注册？',
                    success: (mRes) => {
                      if (mRes.confirm) {
                        wx.reLaunch({ url: '/pages/register/register' })
                      }
                    }
                  })
                  break
              }
            } catch (err) {
              wx.hideLoading()
              wx.showToast({ title: '登录失败', icon: 'none' })
            }
          }
        })
      } else {
        wx.showToast({ title: '需要手机号授权登录', icon: 'none' })
      }
    }
  })