var cached_data = {};

var detail_template = '<div class="panel panel-default">' +
    '<div class="panel panel-heading">' +
        '<div class="row">' +
            '<div class="col-xs-12 stats">' +
                '<div class="row">' +
                    '<div class="col-xs-6">' + gettext('Data last updated on') + '</div><div class="col-xs-6"><span class="badge badge-success">#data_last_update#</span></div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-xs-6">' + gettext('Joined') + '</div><div class="col-xs-6"><span class="badge badge-success">#joined#</span></div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-xs-6">' + gettext('Last active') + '</div><div class="col-xs-6"><span class="badge badge-success">#active#</span></div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '<div class="panel panel-body">' +
        '<div class="row">' +
            '<div class="col-xs-12 summary">' +
            '<div class="row">' +
                '<div class="col-xs-6"><b>' + gettext('Overall') + '</b></div><div class="col-xs-6"><span class="badge badge-success"><b>#title_overall#</b></span></div>' +
            '</div>' +
            '<hr>' +
             '<div class="row">' +
                '<div class="col-xs-6">' + gettext('Adult') + '</div><div class="col-xs-6"><span class="badge badge-success">#title_adult#</span></div>' +
             '</div>' +
             '<div class="row">' +
                '<div class="col-xs-6">' + gettext('Reports') + '</div><div class="col-xs-6"><span class="badge badge-success">#n_adult#</span></div>' +
             '</div>' +
             '<div class="row">' +
                '<div class="col-xs-6">'+ gettext('Score') +'</div><div class="col-xs-6"><span class="badge badge-success">#xp_adult#</span></div>' +
             '</div>' +
             '<hr>' +
             '<div class="row">' +
                 '<div class="col-xs-6">' + gettext('Site') + '</div><div class="col-xs-6"><span class="badge badge-success">#title_site#</span></div>' +
             '</div>' +
             '<div class="row">' +
                '<div class="col-xs-6">' + gettext('Reports') + '</div><div class="col-xs-6"><span class="badge badge-success">#n_site#</span></div>' +
             '</div>' +
             '<div class="row">' +
                '<div class="col-xs-6">'+ gettext('Score') +'</div><div class="col-xs-6"><span class="badge badge-success">#xp_site#</span></div>' +
             '</div>' +
             '<hr>' +
             '<div class="row">' +
                 '<div class="col-xs-6">' + gettext('Other') + '</div><div class="col-xs-6"><span class="badge badge-success">#xp_unrelated#</span></div>' +
             '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +
'</div>';

$(document).ready(function() {
    //$('#datatable').DataTable();
    $('.clickable').click(function(event) {
        var id = $(this).attr('id');
        $('.info').attr( "style", "display:none;");
        $('#hidden_' + id ).fadeIn( "slow", function(){});
        load_user_data(id);
    });

    var rank_to_label = function(value){
        var ranks = {
            1: gettext("Novice"),
            2: gettext("Contributor"),
            3: gettext("Expert"),
            4: gettext("Master"),
            5: gettext("Grandmaster")
        }
        return ranks[value];
    }

    var create_info_div = function(user_uuid, data){
        $('#progress_' + user_uuid).hide();
        var html = detail_template.replace(/#joined#/g, data.joined_value);
        var date = new Date(data.last_update);
        html = html.replace(/#data_last_update#/g, date.toLocaleString(current_locale, { timeZone: 'UTC' }));
        html = html.replace(/#active#/g, data.active_value);
        html = html.replace(/#n_adult#/g, data.score_detail.adult.score_items.length);
        html = html.replace(/#n_bite#/g, data.score_detail.bite.score_items.length);
        html = html.replace(/#n_site#/g, data.score_detail.site.score_items.length);
        html = html.replace(/#title_adult#/g, rank_to_label(data.score_detail.adult.class_value));
        html = html.replace(/#title_bite#/g, rank_to_label(data.score_detail.bite.class_value));
        html = html.replace(/#title_site#/g, rank_to_label(data.score_detail.site.class_value));
        html = html.replace(/#title_overall#/g, rank_to_label(data.overall_class_value));
        html = html.replace(/#xp_adult#/g, data.score_detail.adult.score);
        html = html.replace(/#xp_bite#/g, data.score_detail.bite.score);
        html = html.replace(/#xp_site#/g, data.score_detail.site.score);
        if(data.unrelated_awards.score != null){
            html = html.replace(/#xp_unrelated#/g, data.unrelated_awards.score);
        }else{
            html = html.replace(/#xp_unrelated#/g, "0");
        }

        $('#detail_' + user_uuid).html(html);
        cached_data[user_uuid] = data;
    }

    var load_user_data = function(user_uuid){
        $('#progress_' + user_uuid).show();
        if( cached_data[user_uuid] == null ){
            $.ajax({
                //url: '/api/stats/user_xp_data/?user_id=' + user_uuid,
                url: '/api/stats/user_xp_data/',
                data:{
                    "user_id" : user_uuid,
                    "locale" : current_locale,
                    "update" : true
                },
                method: 'GET',
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type)) {
                        var csrftoken = getCookie('csrftoken');
                        xhr.setRequestHeader('X-CSRFToken', csrftoken);
                    }
                },
                success: function( data, textStatus, jqXHR ) {
                    create_info_div(user_uuid, data);
                    $('#moreinfo_' + user_uuid).show();
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.log(jqXHR.responseJSON);
                }
            });
        }else{
            create_info_div(user_uuid, cached_data[user_uuid]);
        }
    }

} );