Page({
    data: {
      genders: ['男', '女'],
      gender: '',
      genderIndex: -1,
      idCardImages: [], // 存储身份证照片路径
      workCardImages: [], // 存储工作证照片路径
      idCardFileIDs: [], // 存储身份证照片的 fileID
      workCardFileIDs: [], // 存储工作证照片的 fileID
      userType: '', // 身份类型
      name: '', // 姓名
      idCard: '', // 身份证号
      age: '', // 年龄
      hospital: '', // 所在医院
      department: '', // 所在科室
      phone: '' // 联系电话
    },
  
    // 性别选择事件
    bindGenderChange(e) {
      const index = e.detail.value;
      this.setData({
        genderIndex: index,
        gender: this.data.genders[index]
      });
    },
  
    // 上传身份证照片
    uploadIdCard() {
      wx.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          const cloudPath = `idCard/${Date.now()}.png`; // 身份证路径
  
          wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath,
            success: (uploadRes) => {
              const fileID = uploadRes.fileID;
              console.log('身份证上传成功，fileID:', fileID);
  
              // 更新 idCardImages 和 idCardFileIDs 数组
              this.setData({
                idCardImages: [...this.data.idCardImages, filePath],
                idCardFileIDs: [...this.data.idCardFileIDs, fileID]
              });
            },
            fail: (err) => {
              console.error('上传失败', err);
            }
          });
        }
      });
    },
  
    // 上传工作证照片
    uploadWorkCard() {
      wx.chooseImage({
        count: 1,
        success: (res) => {
          const filePath = res.tempFilePaths[0];
          const cloudPath = `workCard/${Date.now()}.png`; // 工作证路径
  
          wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath,
            success: (uploadRes) => {
              const fileID = uploadRes.fileID;
              console.log('工作证上传成功，fileID:', fileID);
  
              // 更新 workCardImages 和 workCardFileIDs 数组
              this.setData({
                workCardImages: [...this.data.workCardImages, filePath],
                workCardFileIDs: [...this.data.workCardFileIDs, fileID]
              });
            },
            fail: (err) => {
              console.error('上传失败', err);
            }
          });
        }
      });
    },
  
    // 删除身份证照片
    deleteIdCardImage(e) {
      const index = e.currentTarget.dataset.index;
      const fileID = this.data.idCardFileIDs[index]; // 获取对应的 fileID
  
      // 删除云存储中的文件
      wx.cloud.deleteFile({
        fileList: [fileID],
        success: (res) => {
          console.log('身份证云存储文件删除成功', res);
  
          // 更新本地数据
          const newIdCardImages = this.data.idCardImages.filter((_, i) => i !== index);
          const newIdCardFileIDs = this.data.idCardFileIDs.filter((_, i) => i !== index);
  
          this.setData({
            idCardImages: newIdCardImages,
            idCardFileIDs: newIdCardFileIDs
          });
  
          console.log('身份证删除成功，当前图片:', newIdCardImages);
        },
        fail: (err) => {
          console.error('删除云存储文件失败', err);
        }
      });
    },
  
    // 删除工作证照片
    deleteWorkCardImage(e) {
      const index = e.currentTarget.dataset.index;
      const fileID = this.data.workCardFileIDs[index]; // 获取对应的 fileID
  
      // 删除云存储中的文件
      wx.cloud.deleteFile({
        fileList: [fileID],
        success: (res) => {
          console.log('工作证云存储文件删除成功', res);
  
          // 更新本地数据
          const newWorkCardImages = this.data.workCardImages.filter((_, i) => i !== index);
          const newWorkCardFileIDs = this.data.workCardFileIDs.filter((_, i) => i !== index);
  
          this.setData({
            workCardImages: newWorkCardImages,
            workCardFileIDs: newWorkCardFileIDs
          });
  
          console.log('工作证删除成功，当前图片:', newWorkCardImages);
        },
        fail: (err) => {
          console.error('删除云存储文件失败', err);
        }
      });
    },
  
    // 表单提交
    async formSubmit(e) {
      const formData = e.detail.value;
      const errors = this.validateForm(formData);
  
      if (errors.length > 0) {
        wx.showToast({ title: errors[0], icon: 'none' });
        return;
      }
  
      if (this.data.idCardFileIDs.length === 0 || this.data.workCardFileIDs.length === 0) {
        wx.showToast({ title: '请上传所有必要的照片', icon: 'none' });
        return;
      }
  
      wx.showLoading({ title: '提交中...' });
  
      try {
        // 构造提交数据
        const data = {
          ...formData,
          gender: this.data.gender,
          idCardPhotos: this.data.idCardFileIDs, // 提交身份证照片 fileID
          workCardPhotos: this.data.workCardFileIDs, // 提交工作证照片 fileID
          createTime: new Date(),
          status: 'pending' // 初始状态
        };
  
        // 调用云函数提交
        const res = await wx.cloud.callFunction({
          name: 'addapplication',
          data
        });
  
        wx.showToast({ title: '提交成功' });
        console.log('提交结果：', formData);
        console.log('清空前的数据：', this.data);
        // 清空表单
        this.setData({
          userType: '',  // 清空身份类型
          gender: '',
          genderIndex: -1,
          idCardImages: [],
          workCardImages: [],
          idCardFileIDs: [],
          workCardFileIDs: [],
          name: '',      // 清空姓名
          idCard: '',    // 清空身份证号
          age: '',       // 清空年龄
          hospital: '',  // 清空医院
          department: '', // 清空科室
          phone: ''      // 清空联系电话
        });
  
        // 打印清空后的数据
        console.log('清空后的数据：', this.data);
      } catch (error) {
        console.error('提交失败：', error);
        wx.showToast({ title: '提交失败，请重试', icon: 'none' });
      } finally {
        wx.hideLoading();
      }
    },
  
    // 表单验证
    validateForm(data) {
      const errors = [];
      if (!data.name) errors.push('请输入姓名');
      if (!this.data.gender) errors.push('请选择性别');
      // 其他验证逻辑可以根据需要添加
      return errors;
    }
  });