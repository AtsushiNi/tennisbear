class ApplicationController < ActionController::API
  require "net/http"
  require "uri"

  def search
    uri = URI.parse("https://www.tennisbear.net")

    headers = {
      "accept": "application/json, text/plain, */*",
      "accept-language": "ja,en-US;q=0.9,en;q=0.8",
      "content-type": "application/json",
      "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    }

    uri.path = "/api/v3/events/search/for-web"
    req = Net::HTTP::Put.new(uri, headers)

    body = {
      "prefectureCodeList":["pref13"],
      "regionCodeList":[],
      "tennis365Flg":false,
      "areaCodeList":[],
      "placeCodeList":[],
      "sunFlg":false,
      "monFlg":false,
      "tuesFlg":false,
      "wedFlg":false,
      "friFlg":false,
      "thursFlg":false,
      "satFlg":false,
      "holidayFlg":false,
      # "dateList":["2023-05-01","2023-04-30"],
      # "timePeriodTypeList":["PERIOD_06_08"],
      "isOpen":true,
      "lookingForMembers":false,
      "levelList":[],
      "tournamentTypeList":[],
      "keyword":nil,
      "maxLat":nil,
      "maxLng":nil,
      "minLat":nil,
      "minLng":nil,
      "indoorFlg":false,
      "courtTypeOmniFlg":false,
      "courtTypeCrayFlg":false,
      "courtTypeHardFlg":false,
      "courtTypeCarpetFlg":false,
      "anyoneBookable":false,
      "anyoneRegisterable":false
    }

    body[:dateList] = [params[:date]]
    body[:isOpen] = params[:isOpen]
    body[:timePeriodTypeList] = params[:timePeriodTypeList].split(",")
    req.body = JSON.generate(body)

    res = Net::HTTP.start(uri.host, uri.port, use_ssl: true) do |http|
      http.request(req)
    end

    render json: JSON.parse(res.body)
  end
end
