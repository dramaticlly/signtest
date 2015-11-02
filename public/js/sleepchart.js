/**
 * Created by stevezhang on 2015-11-02.
 */

function chartinit() {
    var ctx = $("#myChart").get(0).getContext("2d");
    var ctxb = $("#barChart").get(0).getContext("2d");

    var data = {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        datasets: [
            {
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                data: [65, 59, 90, 81, 56, 55, 40]
            },
            {
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                data: [28, 48, 40, 19, 96, 27, 100]
            }
        ]
    }

    var myNewChart = new Chart(ctx).Line(data);
    var mybarChart = new Chart(ctxb).Bar(data);
}