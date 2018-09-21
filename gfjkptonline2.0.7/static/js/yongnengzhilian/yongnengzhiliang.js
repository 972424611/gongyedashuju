/*组件的拼装--开始*/
gulpHtml('header-wrap','../model/gulp/header.html');
gulpHtml('section-left','../model/gulp/section-left.html',function () {
    $.getScript('../plugin/accordion/js/accordion.js');
});
/*组件的拼装--结束*/


var doMainName = 'http://47.106.101.133:8080/gfjkpt';
var thisDay = document.getElementById('this-container');//获取图表容器
var inverter_name = 'inverter1';
var field = '电压';
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
                showChart(nowDate,dateType,inverter_name,field);
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
        showFieldSelect(dateType);
        showChart(nowDate,dateType,inverter_name,field);
    }else if(activeTab === "#thisMonth"){
        nowDate = getNowFormatDate(new Date()).substring(0,7);
        dateType = 'month';
        showFieldSelect(dateType);
        showChart(nowDate,dateType,inverter_name,field);
    }else if(activeTab === "#thisYear"){
        nowDate = getNowFormatDate(new Date()).substring(0,4);
        dateType = 'year';
        showFieldSelect(dateType);
        showChart(nowDate,dateType,inverter_name,field);
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
            showChart(nowDate,dateType,inverter_name,field);
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
showFieldSelect(dateType);
showChart(nowDate,'day',inverter_name,field);//进入页面默认加载当前天的数据
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
    showChart(nowDate,'day',inverter_name,field);
}

function nextDay() {//下一天
    nowDate = addDate(nowDate,1);
    $day_input.val(nowDate);
    showChart(nowDate,'day',inverter_name,field);
}

function previousMonth() {//上一月
    nowDate = getPreMonth(getNowFormatDate(nowDate)).substring(0,7);
    showChart(nowDate,'month',inverter_name,field);
}

function nowMonth() {//本月
    nowDate = getNowFormatDate(new Date()).substring(0,7);
    showChart(nowDate,'month',inverter_name,field);
}

function nextMonth() {//下一月
    nowDate = getNextMonth((getNowFormatDate(nowDate))).substring(0,7);
    showChart(nowDate,'month',inverter_name,field);
}


function previousYear() {
    nowDate = parseInt(nowDate);
    nowDate --;
    showChart(nowDate,'year',inverter_name,field);
}

function nowYear() {
    nowDate = getNowFormatDate(new Date()).substring(0,4);
    showChart(nowDate,'year',inverter_name,field);
}

function nextYear() {
    nowDate = parseInt(nowDate);
    nowDate ++;
    showChart(nowDate,'year',inverter_name,field);
}

function showChart(date,dateType,name,field) {
    $.ajax({
        type: 'post',
        url: doMainName + '/inverter/cvChart',
        dataType: 'json',
        data: {
            date: date,
            type: dateType,
            name: name,
            field: field
        },
        success: function (jsonResult) {
            var totalActivePower = [];
            var times = [];
            if (field === '电流'){
                totalActivePower = jsonResult.data.currentList;
                var aCurrent = pushData(totalActivePower,'aPhaseCurrent');
                var bCurrent = pushData(totalActivePower,'bPhaseCurrent');
                var cCurrent = pushData(totalActivePower,'cPhaseCurrent');
                times = pushData(totalActivePower,'times');
            }else if(field === '电压'){
                totalActivePower = jsonResult.data.voltageList;
                var aVoltage = pushData(totalActivePower,'aPhaseVoltage');
                var bVoltage = pushData(totalActivePower,'bPhaseVoltage');
                var cVoltage = pushData(totalActivePower,'cPhaseVoltage');
                times = pushData(totalActivePower,'times');
            }else {
                console.log('field错误');
            }
            var titleDateRight;
            var chartTitle = '';
            if(dateType === 'day'){
                titleDateRight = getNowChineseDate(date);
                chartTitle =  titleDateRight + "-" + field + '相位监测';
                console.log(titleDateRight);
            }else if(dateType === 'month'){
                titleDateRight = getNowChineseDate(date);
                chartTitle = titleDateRight + "-" + field + '相位监测';
            }else if(dateType === 'year'){
                chartTitle = getNowChineseDate(date) +  "-" + field + '相位监测';
            }
            if(field === '电压'){
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
                    data : ['a相电压(V)','b相电压(V)','c相电压(V)'],
                    left : 10,
                    bottom : 0
                },
                xAxis: {
                    type: 'category',
                    data: times
                },
                yAxis: [
                    {
                        name : '伏特（V）',
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name : 'a相电压(V)',
                        data: aVoltage,
                        type: 'bar',
                        smooth: true,
                        yAxisIndex : 0,
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
                        name : 'b相电压(V)',
                        data: bVoltage,
                        type: 'bar',
                        smooth: true,
                        yAxisIndex : 0,//规定使用的坐标
                        itemStyle : {
                            color : '#C23531'
                        }
                    },
                    {
                        name : 'c相电压(V)',
                        data: cVoltage,
                        type: 'bar',
                        smooth: true,
                        yAxisIndex : 0,
                        itemStyle : {
                            color : '#008000'
                        }
                    }
                ]
            };
            }else {
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
                        data : ['a相电流(A)','b相电流(A)','c相电流(A)'],
                        left : 10,
                        bottom : 0
                    },
                    xAxis: {
                        type: 'category',
                        data: times
                    },
                    yAxis: [
                        {
                            name : '安培（A）',
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name : 'a相电流(A)',
                            data: aCurrent,
                            type: 'bar',
                            smooth: true,
                            yAxisIndex : 0,
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
                            name : 'b相电流(A)',
                            data: bCurrent,
                            type: 'bar',
                            smooth: true,
                            yAxisIndex : 0,//规定使用的坐标
                            itemStyle : {
                                color : '#C23531'
                            }
                        },
                        {
                            name : 'c相电流(A)',
                            data: cCurrent,
                            type: 'bar',
                            smooth: true,
                            yAxisIndex : 0,
                            itemStyle : {
                                color : '#008000'
                            }
                        }
                    ]
                };
            }
            loadChart(thisDay,option);
        },
        error : function (err) {
            throw Error(err);
        }

    })
}

function pushData(data,dataName) {//把json数据中的每一项解析并拼装成数组
    var result = [];
    for(var i = 0; i < data.length; i++){
        result.push(data[i][dataName]);
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

/*显示下拉菜单--开始*/
function showFieldSelect(dateType) {
    var optionStr = [];
    var optionValueArr = [];
    if(dateType === 'day' ||dateType === 'month' || dateType === 'year'){
        optionValueArr = ['电压','电流'];
    }else {
        throw Error('dateType is error!');//日期类型不正确时抛出异常
    }
    for(var i = 0; i < optionValueArr.length; i++){
        optionStr = optionStr + '<option value="'+ optionValueArr[i] + '">' + optionValueArr[i] + '</option>'
    }
    $('.field-select').html('<label for="field-select">数据选择：</label>\n' +
        '                                    <select name="" id="field-select"  onchange="listenSelectChang($(this))">\n' + optionStr +
        '                                    </select>');
}
/*显示下拉菜单--结束*/
/*监听下拉菜单的值的变化并进行相应操作--开始*/
function listenSelectChang(obj) {
    field = obj.children('option:selected').val();
    console.log(field);
    showChart(nowDate,dateType,inverter_name,field);
}
/*监听下拉菜单的值的变化并进行相应操作--结束*/