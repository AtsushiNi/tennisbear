import * as React from 'react'
import { useEffect, useState } from 'react'
import './App.css';

import GoogleMap from './Components/GoogleMap'

import { ConfigProvider, Row, Col, Button, Table, Avatar, DatePicker, Spin } from 'antd'

const dayjs = require("dayjs")

function App() {
  const [events, setEvents] = useState([])
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [isOpen, setIsOpen] = useState(true)
  const [pagination, setPagination] = useState({current: 1, pageSize: 20})
  const [hoverIndex, setHoverIndex] = useState(null)

  const onChangeDate = date => {
    if(!date) {
      setDate(dayjs().format("YYYY-MM-DD"))
    } else {
      setDate(date.format("YYYY-MM-DD"))
    }
  }

  const onChangeIsOpen = event => {
    if(isOpen) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }

  // イベント一覧の取得
  useEffect(() => {
    const params = { date: date, isOpen: isOpen }
    const query = new URLSearchParams(params)

    const searchEvents = async() => {
      let response =  await fetch("http://localhost:5000/search?"+query)
      const newEvents = await response.json()

      console.log("search with tennisbear API")

      setEvents(newEvents)
      fetchEventDetails(newEvents)
    }
    searchEvents()

  }, [date, isOpen])

  const fetchEventDetails = async(oldEvents = events) => {
    console.log("fetch Event details")
    const ids = oldEvents
      .slice((pagination.current-1) * pagination.pageSize, pagination.current * pagination.pageSize)
      .filter(event => !("detail" in event))
      .map(event => event.id)
    const details = await Promise.all(
      ids.map(id => fetch("http://localhost:5000/events/" + id).then(res => res.json()))
    )

    // state更新
    const newEvents = oldEvents.map(event => {
      if(ids.includes(event.id)) {
        event.detail = details.find(detail => detail.id === event.id)
        return event
      } else {
        return event
      }
    })
    setEvents(newEvents)
  }
  // イベント詳細一覧の取得
  useEffect(() => {
    fetchEventDetails()
  }, [pagination])

  const columns = [
    {
      title: "主催者",
      dataIndex: "organizer",
      key: "organizer",
      render: (text, { avatarSrc }) => {
        if(text.length <= 10) return (
          <>
            <Avatar
              src={avatarSrc}
            />
            <p
              style={{fontSize: "5px"}}
            >
              {text}
            </p>
          </>
        )
        return <><Avatar src={avatarSrc} /><p style={{fontSize: "5px"}}>{text.substr(0,8) + ".."}</p></>
      }
    },
    {
      title: "時刻",
      dataIndex: "datetime",
      key: "organizer",
      render: text => <><p style={{fontSize: "5px"}}>{text.split(' ')[0]}</p><p style={{fontSize: "5px"}}>{text.split(' ')[1]}</p></>
    },
    {
      title: "タイトル",
      dataIndex: "title",
      key: "title",
      render: text => {
        if(text.length <= 30) return <p style={{fontSize: "12px"}}>{text}</p>
        return <p style={{fontSize: "12px"}}>{text.substr(0,30) + ".."}</p>
      }
    },
    {
      title: "レベル",
      dataIndex: "level",
      key: "level"
    },
    {
      title: "参加者",
      dataIndex: "participants",
      key: "participants",
      render: data => {
        if(data == null) return <Spin />
        else if(data == "非公開") return "非公開"
        else return (
          <div style={{flex: "left", display: "flex"}}>
            {data.map(user =>
              <div style={{marginRight: "10px"}}>
                <div>{user.age ? user.age.name : "非公開"}</div>
                {
                  (!user.gender) ? <div>非公開</div>
                    : (user.gender.name == "男性") ? <div style={{color: "skyblue"}}>男性</div>
                      : <div style={{color: "hotpink"}}>女性</div>
                }
                <div>{user.level ? "Lv." + user.level.id : "非公開"}</div>
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: "参加費",
      dataIndex: "id",
      key: "price",
      render: (data, event) => {
        if (event.detail == undefined) return <Spin/>
        else {
          const price = event.detail.priceOverview
          // 時間計算のため一時的に2023/1/1を入れている
          const startAt = dayjs("2023/01/01 " + event.datetime.split(' ')[1].split("-")[0])
          const endAt = dayjs("2023/01/01 " + event.datetime.split(' ')[1].split("-")[1])
          return price + "円 / " + endAt.diff(startAt, "h", true) + "時間"
        }
      }
    }
  ]

  const data = events.map((event, index) => ({
    key: index,
    id: event.id,
    avatarSrc: event.imageUrl,
    organizer: event.organizer.name,
    datetime: event.datetimeForDisplay,
    title: event.eventTitle,
    level: "Lv." + event.minLevel.id + "~" + event.maxLevel.id,
    isFull: event.isFull,
    detail: event.detail,
    participants: !("detail" in event) ?
      null
      : event.detail.participantList.length == 0 ?
        "非公開"
        : event.detail.participantList.map(participant => participant.user)
  }))

  const places = events
    .slice((pagination.current-1) * pagination.pageSize, pagination.current * pagination.pageSize)
    .map(event =>  ({lat: event.place.lat, lng: event.place.lng}))

  const theme = {
    token: {
      colorPrimary: "#00B86B"
    }
  }

  return (
    <div className="App">
      <ConfigProvider theme={theme}>
        <div style={{margin: "50px"}}>
          <Row>
            <Col>
              <Button type="primary" style={{"fontWeight": "bold"}}>東京都</Button>
            </Col>
            <Col>
              <DatePicker
                defaultValue={dayjs()}
                format={'MM/DD'}
                onChange={onChangeDate}
              />
            </Col>
            <Col>
              <Button
                type={isOpen ? "primary" : "default"}
                onClick={onChangeIsOpen}
              >
                募集中
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <Table
                dataSource={data}
                columns={columns}
                pagination={{pageSize: 20}}
                scroll={{y: 600}}
                style={{marginRight: "50px"}}
                rowClassName={(record, index) => {
                  if(record.isFull) return "table-row-dark"
                  else return "table-row-light"
                  }}
                onChange={pagination => setPagination(pagination)}
                onRow={(record,index) => {
                  return {
                    onClick: event => window.open("https://www.tennisbear.net/event/" + record.id + "/info", "_blank"),
                    onMouseEnter: event => setHoverIndex(index),
                    onMouseLeave: event => setHoverIndex()
                  }
                }}
                />
            </Col>
            <Col>
              <GoogleMap places={places} hoverIndex={hoverIndex}/>
            </Col>
          </Row>
        </div>
      </ConfigProvider>
    </div>
  );
}

export default App;
