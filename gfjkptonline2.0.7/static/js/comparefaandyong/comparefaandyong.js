/*组件的拼装--开始*/
gulpHtml('header-wrap','../model/gulp/header.html');
gulpHtml('section-left','../model/gulp/section-left.html',function () {
    $.getScript('../plugin/accordion/js/accordion.js');
});
/*组件的拼装--结束*/


var doMainName = 'http://47.106.101.133:8080/gfjkpt';
var thisDay = document.getElementById('this-container');//获取图表容器
var field = '日发电量';
var dateType = 'day';
var nowDate = getNowFormatDate(new Date());
var $day_input = $('#day-input');
var $previous_day = $('.previous-day');
var $next_day = $('.next-day');
var $previous_month = $('#previous-month');
var $now_month = $('#now-month');
var $next_month = $('#next-month');
var $previous_year = $('#previous-year');
var $now_year = $('#now-year');
var $next_year = $('#next-year');
/*树形菜单开始*/
var setting = {
    data: {
        simpleData: {
            enable: true
        }
    },
    callback: {
        onClick: function (event, treeId, treeNode) {
            console.log(treeId, treeNode);
            if(treeNode.level === 0){
                return 0;
            }else {
                showChart(nowDate,dateType);
                console.log('2');
            }
        }
    }
};

var zNodes =[
    { id:1, pId:0, name:"综合教学楼", isParent : true},
    { id:11, pId:1, name:"综合教学楼"},
    { id:2, pId:0, name:"工科楼"},
    { id:21, pId:2, name:"工科一号楼"},
    { id:22, pId:2, name:"工科二号楼"}
];
$.fn.zTree.init($("#myTree"), setting, zNodes);
/*树形菜单结束*/


$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {//shown.bs.tab为tab选项卡高亮事件,
    //关键操作！！！！
    // 获取已激活的标签页的名称
    var activeTab = $(e.target)[0].hash;//hash 属性是一个可读可写的字符串，该字符串是 URL 的锚部分（从 # 号开始的部分）
    if(activeTab === '#thisDay'){
        nowDate = getNowFormatDate(new Date());
        $day_input.val(nowDate);
        dateType = 'day';
        showChart(nowDate,dateType);
    }else if(activeTab === "#thisMonth"){
        nowDate = getNowFormatDate(new Date()).substring(0,7);
        dateType = 'month';
        showChart(nowDate,dateType);
    }else if(activeTab === "#thisYear"){
        nowDate = getNowFormatDate(new Date()).substring(0,4);
        dateType = 'year';
        showChart(nowDate,dateType);
    }
});


//根据日期加载表格
function loadChart(dateElem,dateChartOption) {//第一个参数为日期的类型（年月周日季度）,第二个为不同类型日期对应的表格的设置
    echarts.dispose(dateElem);
    var thisDayChart = echarts.init(dateElem);
    thisDayChart.setOption(dateChartOption);
    window.onresize = function () {
        thisDayChart.resize();
    };
}

/**layui日期插件**/
layui.use('laydate', function(){
    var laydate = layui.laydate;
    laydate.render({
        elem: '#day-input',
        type : 'date',
        done: function(value){
            nowDate = value;
            showChart(nowDate,dateType);
        }
    });
    laydate.render({
        elem: '#custom-input-left',
        type : 'date'
    });
    laydate.render({
        elem: '#custom-input-right',
        type : 'date'
    })
});


/*日期选择模块开始*/

showChart(nowDate,'day');//进入页面默认加载当前天的数据
previewPic();
$day_input.val(nowDate);

$previous_day.on('click',function () {
    previousDay();
});
$next_day.on('click',function () {
    nextDay();
});
$previous_month.on('click',function () {
    previousMonth();
});
$now_month.on('click',function () {
    nowMonth();
});
$next_month.on('click',function () {
    nextMonth();
});
$previous_year.on('click',function () {
    previousYear();
});
$now_year.on('click',function () {
    nowYear();
});
$next_year.on('click',function () {
    nextYear();
});

function previousDay() {//上一天
    nowDate = addDate(nowDate,-1);
    $day_input.val(nowDate);
    showChart(nowDate,'day');
}

function nextDay() {//下一天
    nowDate = addDate(nowDate,1);
    $day_input.val(nowDate);
    showChart(nowDate,'day');
}

function previousMonth() {//上一月
    nowDate = getPreMonth(getNowFormatDate(nowDate)).substring(0,7);
    showChart(nowDate,'month');
}

function nowMonth() {//本月
    nowDate = getNowFormatDate(new Date()).substring(0,7);
    showChart(nowDate,'month');
}

function nextMonth() {//下一月
    nowDate = getNextMonth((getNowFormatDate(nowDate))).substring(0,7);
    showChart(nowDate,'month');
}


function previousYear() {
    nowDate = parseInt(nowDate);
    nowDate --;
    showChart(nowDate,'year');
}

function nowYear() {
    nowDate = getNowFormatDate(new Date()).substring(0,4);
    showChart(nowDate,'year');
}

function nextYear() {
    nowDate = parseInt(nowDate);
    nowDate ++;
    showChart(nowDate,'year');
}

function showChart(date,dateType) {
    $.ajax({
        type: 'post',
        url: doMainName + '/load/contrast',
        dataType: 'json',
        data: {
            date: date,
            type: dateType
        },
        success: function (jsonResult) {
            console.log(jsonResult);
            var powerGeneration = pushData(jsonResult,'powerGeneration');
            var powerConsumption = pushData(jsonResult,'powerConsumption');
            var times = pushData(jsonResult,'times');
            var titleDateLeft;
            var chartTitle = '';
            if(dateType === 'day'){
                titleDateLeft = getNowChineseDate(date);
                chartTitle = titleDateLeft  + "-"  + '发-用电量比较';
            }else if(dateType === 'month'){
                titleDateLeft = getNowChineseDate(date);
                chartTitle = titleDateLeft + "-"  + '发-用电量比较';
            }else if(dateType === 'year'){
                chartTitle = getNowChineseDate(date) +  "-" + '发-用电量比较';
            }
            var option = {
                title : {
                    text : chartTitle,
                    left : 'center'
                },
                tooltip : {
                    show : true,
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999'
                        }
                    }
                },
                toolbox: {
                    feature: {
                        dataView: {show: true, readOnly: false},
                        magicType: {show: true, type: ['line', 'bar']},
                        restore: {show: true},
                        saveAsImage: {show: true}
                    }
                },
                legend : {
                    data : ['发电量（wh）','用电量（wh）'],
                    left : 20,
                    bottom : 0
                },
                xAxis: {
                    type: 'category',
                    data: times
                },
                yAxis: [
                    {
                        name : '发电量（wh）',
                        type: 'value'
                    },
                    {
                        name : '用电量（wh）',
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name : '发电量（wh）',
                        data: powerGeneration,
                        type: 'line',
                        smooth: true,
//                      yAxisIndex : 0,
                        markPoint : {
                            data : [ {
                                type : 'max',
                                name : 'max'
                            }, {
                                type : 'min',
                                name : 'min'
                            } ]
                        },
                        itemStyle : {
                            color : '#2F4554'
                        }
                    },
                    {
                        name : '用电量（wh）',
                        data: powerConsumption,
                        type: 'line',
                        smooth: true,
//                      yAxisIndex : 1,//规定使用的坐标
                        itemStyle : {
                            color : '#C23531'
                        }
                    }
                ]
            };
            loadChart(thisDay,option);
        },
        error : function (err) {
            throw Error(err);
        }

    })
}

function pushData(data,dataName) {//把json数据中的每一项解析并拼装成数组
    var result = [];
    for(var i = 0; i < data.data.length; i++){
        result.push(data.data[i][dataName]);
    }
    return  result;
}
/*日期选择模块结束*/


/*动态加载六张图片的数据--开始*/
function previewPic() {
    $.ajax({
        type : 'post',
        dataType : 'json',
        url : doMainName + '/inverter/icon',
        success : function (data) {
            var result = data.data;
            $('#currentOutput').html(result.currentOutput + 'W');
            $('#irradiance').html(result.irradiance + 'W/㎡');
            $('#temperature').html(result.temperature + '℃');
            $('#co2Reduction').html(result.co2Reduction + 't');
            $('#equivalentTree').html(result.equivalentTree.toFixed(4) + '棵');
            $('#totalIncome').html(result.totalIncome + '元');
        },
        error : function (err) {
            console.log(err);
        }
    })
}
/*动态加载六张图片的数据--结束*/


