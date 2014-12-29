'use strict';
// epdApp
var matrialchoose_module = angular.module('epdApp.matrialchoose', ['ng.ueditor']);
matrialchoose_module.controller('MaterialChooseController', ['$scope', '$http', '$routeParams', '$rootScope', '$timeout','$modal','notify',
    function($scope, $http, $routeParams, $rootScope, $timeout, $modal, notify) {

        $scope.appId = $routeParams.appId;
        $scope.MCconfig = {
            toolbars: [],
            autoHeightEnabled: true,
            autoFloatEnabled: false,
            initialFrameWidth: "100%",
            enableAutoSave: 'auto', //自动保存
            imageScaleEnabled: true,
            elementPathEnabled: false,
            wordCount: true,
            maximumWords: 600,
            pasteplain: true,
            wordOverFlowMsg: '<span style="color:red;">字数超出最大限制</span>'
        };

        // 增加ueditior按钮   新建图文页面

        // $scope.CusUEReadyFunc = function(ue) {
        //     console.info("....")
        //     $scope.ueObject = ue;
        //     ue.commands['insertimgs'] = {
        //         execCommand: function() {
        //             $scope.executeEvent('image');
        //         }
        //     }
        // }


        // 与外部交互
        // $scope.customConfig

        /*
         * 扩展外部设置
         */
        $scope.MCconfig = $.extend({}, $scope.MCconfig, $scope.CusConfig || {});

        // 判断规则 http://dchat.dxy.cn/japi/weixin/autoreply/rule/typeinfos -> filter:type
        $scope.showItemChoose = $scope.showItemChoose || {};

        // 已经选择的过滤器样式
        $scope.chooseItemLists = $scope.chooseItemLists || {};


        // 需要返回的参数
        /*
         *
         "201":{"label":"文本素材","op":{"edit":0}},
         "202":{"label":"图文消息","op":{"edit":0}},
         "203":{"label":"图片","op":{"edit":0}},
         "204":{"label":"语音","op":{"edit":0}},
         "205":{"label":"视频","op":{"edit":0}},
         "206":{"label":"文本","op":{"edit":1}},
         "211":{"label":"查找通讯录","op":{"edit":1},"properties":{"reply":{"label":"正则过滤","init":"","tag":"input","type":"text","placeholder":""},"notFoundReply":{"label":"未找到应答","init":"","tag":"input","type":"text","placeholder":""}}},

         * */
        $scope.materialType = {
            link: 200,
            text: 201,
            news: 202,
            image: 203,
            voice: 204,
            video: 205,
            content: 206,
            contact: 211
        };
        $scope.chooseMaterialed = $scope.chooseMaterialed =  "";
        $scope.isMaterialSelected = false;
        $scope.chooseType = false;
        // 类型ID，详情见 /static/v1/assets/js/dxy/p_autoreply/type_info.js
        $scope.chooseTypeId = $scope.materialType["content"];

        $scope.materialIconGroup = {
            link: 'fa-file-link-o',
            text: "fa-file-text-o",
            image: "fa-file-image-o",
            voice: "fa-file-audio-o",
            video: "fa-film",
            multiple: "fa-list",
            file: "fa-file-o"
        };

        // 路径可选择素材
        $scope.executeEventLists = {
            link: {
                url: '/japi/qiye/linkmeterial/list'//怎么写？
            },
            text: {
                url: '/japi/qiye/textmeterial/list'
            },
            image: {
                url: '/japi/media/list?type=image'
            },
            voice: {
                url: '/japi/media/list?type=voice'
            },
            video: {
                url: '/japi/media/list?type=video'
            },
            multiple: {
                url: '/japi/weixin/news/manage/list'
            },
            file: {
                url: '/japi/file/list'
            }
        };


        // 执行事件选择
        $scope.executeEvent = function(type) {
            var modelConfig = { t: "", c: "" };
            $scope.chooseType = type;

            // 设置选中
            switch (type) {
                case "link":
                    modelConfig.t = "/static/v1/qy/app/view_material/material_choose_link.html";
                    modelConfig.c = "addExecuteEventModalLinkController";
                    break;
                case "image":
                    modelConfig.t = "/static/v1/qy/app/view_material/material_choose_image.html";
                    modelConfig.c = "addExecuteEventModalImageController";
                    break;
                case "voice":
                    modelConfig.t = "/static/v1/qy/app/view_material/material_choose_voice.html";
                    modelConfig.c = "addExecuteEventModalVoiceController";
                    break;
                case "video":
                    modelConfig.t = "/static/v1/qy/app/view_material/material_choose_video.html";
                    modelConfig.c = "addExecuteEventModalVideoController";
                    break;
                case "text":
                    modelConfig.t = "/static/v1/qy/app/view_material/material_choose_text.html";
                    modelConfig.c = "addExecuteEventModalTextController";
                    break;
                case "multiple":
                    modelConfig.t = "/static/v1/qy/app/view_material/material_choose_multiple.html";
                    modelConfig.c = "addExecuteEventModalMultipleController";
                    $scope.chooseType = "news";
                    break;
                case "file":
                    modelConfig.t = "/static/v1/qy/app/view_material/material_choose_file.html";
                    modelConfig.c = "addExecuteEventModalFileController";
                    break;
            }

            // 自定义Modal
            $scope.currentOpenModal = $modal.open({
                templateUrl: modelConfig.t,
                controller: modelConfig.c,
                size: 'lg',
                scope: $scope,
                resolve: {
                    items: function () {

                    }
                }
            });
        };

        // $scope.CusUEObject = $scope.CusUEObject || {};

        function setUeObject(ue) {
            /**
            * UEditor准备完毕的时候，获取准备的UE对象
            */
            $scope.CusUEObject = ue;
            console.log(ue);
        }

        // 获取页面样式
        $scope.executeEventAction['image'] = function(ue) {
            $scope.executeEvent('image');
            setUeObject(ue);
        }

        var materialAction = {
            data: {
                id: "",
                title: "",
                url: "",
                obj: {}
            },
            sendTheMateria: function() {
                var self = this;
                $scope.chooseMaterialed = self.data.id;
                $scope.materialTitle = self.data.title;
                $scope.materialUrl = self.data.url;
                $scope.materiaObj = self.data.obj;
                console.log($scope.materiaObj,self.data);
                if($scope.materiaObj){
                    var webroot = $scope.simconfigs.webroot,
                        newsurl = $scope.materiaObj.newsurl,
                        regExp = new RegExp(webroot,"gi"),
                        newsItems = $scope.materiaObj.newsItems;
                    $scope.isSerect = false;
                    angular.forEach(newsItems,function(newsItem){
                        if(regExp.test(newsItem.newsUrl) == false){
                            $scope.isSerect = true;
                            $scope.keepSafe = null;
                            $scope.keepMsgSafe = null;
                            return;
                        }
                    });
                }
                if($scope.materialUrl) {
                    console.info($scope.ueObject)
                    $scope.CusUEObject.execCommand( 'insertimage', {
                        src: $scope.materialUrl,
                        width:'100',
                        height:'100'
                    } );
                }
            }
        }

        //插入链接
        $scope.getLinkAddress = function(linkCont,linkAddr) {
            /*先清空编辑器*/
            $scope.clearMaterialAction();
            notify.closeAll();
            if(!$scope.cusRouteParams.checkUrl(linkAddr)){
                notify({
                    message: '链接不合法',
                    classes: "alert-danger" // alert-danger
                });
                return false;
            }
            if($scope.CusUEObject) {
                $scope.CusUEObject.execCommand( 'link',{
                    href: linkAddr,
                    title: linkCont,
                    target:'_blank',
                    textValue: linkCont
                });
            }
            // 关闭弹窗
            $scope.currentOpenModal.close();
        }

        //获取编辑框显示数据
        $scope.getMaterialAction = function(materialId, materialTitle, materialUrl, materiaObj) {
            /*先清空编辑器*/
            $scope.CusUEObject.execCommand('cleardoc');

            materialAction.data.id = materialId;
            materialAction.data.title = materialTitle;
            materialAction.data.url = materialUrl;
            materialAction.data.obj = materiaObj;
            //点击选择效果
            $scope.isChoosed = [];
            $scope.isChoosed[materialId] = true;
        }

        $scope.chooseMaterialAction = function() {
            console.info($scope.CusUEObject)
            //先清空输入框
            // 此处应该写成指令
            // getUEIframe()
            // var ifr = getUEIframe();
            $scope.isMaterialSelected = true;
            $scope.materialIcon = $scope.materialIconGroup[$scope.chooseMaterialIType];

            // 添加 type id
            $scope.chooseTypeId = $scope.materialType[$scope.chooseType];

            // 隐藏输入
            if($scope.CusUEObject){
                $scope.CusUEObject.setDisabled();
            }

            materialAction.sendTheMateria();

            // 关闭弹窗
            $scope.currentOpenModal.close();
        };

        $scope.clearMaterialAction = function() {

            $scope.chooseMaterialed = "";
            $scope.materialTitle = "";
            $scope.isMaterialSelected = false;
            $scope.isSerect = false;
            $scope.chooseTypeId = $scope.materialType["content"];
            // 输入
            // 隐藏输入
            if($scope.CusUEObject){
                $scope.CusUEObject.setEnabled();
            }
        };

    }
]);

// 链接
matrialchoose_module
    .controller('addExecuteEventModalLinkController', ['$scope', function($scope){
        $scope.getMaterialLists = function() {

        };

        $scope.init = function(){
            console.info('hello');
        };
    }]);
// 文本
matrialchoose_module
    .controller('addExecuteEventModalTextController', ['$scope', '$http', function($scope, $http){

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
            $scope.refreshTextList($scope.currentPage, 5);
        };
        var setPagination = $scope.setPagination = function(totalItems, currentPage, size) {
            $scope.totalItems = totalItems;
            $scope.currentPage = currentPage;
            $scope.maxSize = size;
        };

        $scope.refreshTextList = function(page, size) {
            var materialTextList = '/japi/qiye/textmeterial/list?applicationId=' + $scope.appId + '&page='+ page +'&size=' + size;
            $http.get(materialTextList).success(function(data) {
                $scope.isAttachmentEmpty = false;
                if(data.success && data.items.length) {
                    $scope.textLists = data.items;
                    // 设置分页
                    setPagination(data.pageBean.count, data.pageBean.current, size);
                } else {
                    $scope.isAttachmentEmpty = true;
                }
            });
        };

        $scope.init = function(){
            $scope.refreshTextList(1, 5);
            console.info('hello')
        };

    }]);
// 图片
matrialchoose_module
    .controller('addExecuteEventModalImageController', ['$scope', '$http', function($scope, $http ) {
        // 分页
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
            refreshImageList($scope.currentPage, $scope.maxSize);
        };
        $scope.setPagination = function(totalItems, currentPage, size) {
            $scope.totalItems = totalItems;
            $scope.currentPage = currentPage;
            $scope.maxSize = size;
        };

        // 刷新
        var refreshImageList = $scope.refreshImageList = function(page, size) {
            var materialImgList = '/japi/media/list?applicationId=' +  $scope.appId + '&type=image&page='+ page +'&size=' + size;
            $http.get(materialImgList).success(function(data) {
                if(data.success && data.attachments.length) {
                    $scope.isAttachmentEmpty = false;
                    $scope.imageLists = data.attachments;
                    // 设置分页
                    $scope.setPagination(data.pageBean.count, data.pageBean.current, size);
                } else {
                    $scope.isAttachmentEmpty = true;
                }
            });
        };

        $scope.init = function() {
            $scope.refreshImageList(1, 18);
        };
    }]);
// 声音
matrialchoose_module
    .controller('addExecuteEventModalVoiceController', ['$scope', '$http', '$filter', function($scope, $http, $filter){

        // 分页
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
            refreshVoiceList($scope.currentPage, $scope.maxSize);
        };
        $scope.setPagination = function(totalItems, currentPage, size) {
            $scope.totalItems = totalItems;
            $scope.currentPage = currentPage;
            $scope.maxSize = size;
        };

        // 刷新页面
        var refreshVoiceList = $scope.refreshVoiceList = function(page, size) {
            var materialVoiceList = '/japi/media/list?applicationId=' + $scope.appId + '&type=voice&page='+ page +'&size=' + size;
            $http.get(materialVoiceList).success(function(data) {
                if(data.success && data.attachments.length) {
                    $scope.isAttachmentEmpty = false;
                  /*  $scope.voiceLists = data.attachments;*/
                    $scope.voiceLists = $filter('dateHandler')(data.attachments);//采用过滤器方式按年月分类

                    // 设置分页
                    $scope.setPagination(data.pageBean.count, data.pageBean.current, size);
                } else {
                    $scope.isAttachmentEmpty = true;
                }
            });
        };

        $scope.init = function() {
            $scope.refreshVoiceList(1, 5);
        };
    }]);
// 视频
matrialchoose_module
    .controller('addExecuteEventModalVideoController', ['$scope', '$http', function($scope, $http){

        // 分页
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
            refreshVideoList($scope.currentPage, $scope.maxSize);
        };
        $scope.setPagination = function(totalItems, currentPage, size) {
            $scope.totalItems = totalItems;
            $scope.currentPage = currentPage;
            $scope.maxSize = size;
        };

        // 刷新页面
        var refreshVideoList = $scope.refreshVideoList = function(page, size) {
            var materialImgList = '/japi/media/list?applicationId=' + $scope.appId + '&type=video&page='+ page +'&size=' + size;
            $http.get(materialImgList).success(function(data) {
                $scope.isAttachmentEmpty = false;
                if(data.success && data.attachments.length) {
                    $scope.videoLists = data.attachments;
                    // 设置分页
                    $scope.setPagination(data.pageBean.count, data.pageBean.current, size);
                } else {
                    $scope.isAttachmentEmpty = true;
                }
            });
        };

        $scope.init = function() {
            $scope.refreshVideoList(1, 5);
        };
    }]);
// 图文
matrialchoose_module
    .controller('addExecuteEventModalMultipleController', ['$scope', '$http', function($scope, $http) {
        // 更新素材列表
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
            refreshMultipleList($scope.currentPage, $scope.maxSize);
        };
        $scope.setPagination = function(totalItems, currentPage, size) {
            $scope.totalItems = totalItems;
            $scope.currentPage = currentPage;
            $scope.maxSize = size;
        };

        // 刷新页面
        var refreshMultipleList = $scope.refreshMaterialList = function(page, size) {
            var multipleList = '/japi/weixin/news/manage/list?applicationId=' + $scope.appId + '&page='+ page +'&size=' + size;
            $http.get(multipleList).success(function(data) {
                if(data.success && data.items.length) {
                    $scope.isAttachmentEmpty = false;
                    $scope.multipleLists = data.items;
                    $scope.setPagination(data.pageBean.count, data.pageBean.current, size);
                } else {
                    $scope.isAttachmentEmpty = true;
                }
            });
        };

        $scope.init = function() {
            $scope.refreshMaterialList(1, 6);
        };
    }]);
// 文件
matrialchoose_module
    .controller('addExecuteEventModalFileController', ['$scope', '$http','$filter', function($scope, $http, $filter) {
        $scope.setClass = function(ext){
            var file = {
                "txt": "fa-file-text-o",
                "xml": "fa-file-code-o",
                "pdf": "fa-file-pdf-o",
                "zip": "fa-file-zip-o",
                "doc": "fa-file-word-o",
                "ppt": "fa-file-powerpoint-o",
                "xls": "fa-file-excel-o",
                "xlsx": "fa-file-excel-o",
                "docx": "fa-file-word-o",
                "pptx": "fa-file-powerpoint-o"
            };
            return file[ext];
        };
        // 分页
        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
        $scope.pageChanged = function() {
            refreshFileList($scope.currentPage, $scope.maxSize);
        };
        $scope.setPagination = function(totalItems, currentPage, size) {
            $scope.totalItems = totalItems;
            $scope.currentPage = currentPage;
            $scope.maxSize = size;
        };

        // 刷新页面
        var refreshFileList = $scope.refreshFileList = function(page, size) {
            var materialFileList = '/japi/file/list?applicationId=' + $scope.appId + '&page='+ page +'&size=' + size;
            $http.get(materialFileList).success(function(data) {
                if(data.success && data.files.length) {
                    $scope.isAttachmentEmpty = false;
                    $scope.fileLists = $filter('dateHandler')(data.files);//采用过滤器方式按年月分类

                    // 设置分页
                    $scope.setPagination(data.pageBean.count, data.pageBean.current, size);
                } else {
                    $scope.isAttachmentEmpty = true;
                }
            });
        };

        $scope.init = function() {
            $scope.refreshFileList(1, 5);
        };
    }]);
