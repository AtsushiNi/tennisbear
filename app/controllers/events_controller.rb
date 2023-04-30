class EventsController < ActionController::API
  def show
    uri = URI.parse("https://www.tennisbear.net")

    uri.path = "/api/v3/events/" + params[:id] + "/detail-page"
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    req = Net::HTTP::Get.new(uri)
    response = http.request(req)

    render json: JSON.parse(response.body)
  end
end
