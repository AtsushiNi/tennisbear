import * as React from 'react'
import { useEffect, useState } from 'react'
import './App.css';

import GoogleMap from './Components/GoogleMap'

import { ConfigProvider, Row, Col, Button, Table, Avatar, DatePicker, Spin, Modal, Slider } from 'antd'

const dayjs = require("dayjs")

function App() {
  const [events, setEvents] = useState([])
  const [showingEventIDs, setShowingEventIDs] = useState([])
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"))
  const [isOpen, setIsOpen] = useState(true)
  const [pagination, setPagination] = useState({current: 1, pageSize: 20})
  const [hoverIndex, setHoverIndex] = useState(null)

  const [timePeriodTypeList, setTimePeriodTypeList] = useState([])
  const [isOpenTimeSelector, setIsOpenTimeSelector] = useState(false)

  const [levelList, setLevelList] = useState([6])
  const [isOpenLevelSelector, setIsOpenLevelSelector] = useState(false)

  const [isExceptFifty, setIsExceptFifty] = useState(true)

  const [priceRange, setPriseRange] = useState([0, 3000])

  const handleChangePriceRange = range => {
    setPriseRange(range)
  }

  const toggleIsExceptFifty = () => {
    if(isExceptFifty) setIsExceptFifty(false)
    else setIsExceptFifty(true)
  }

  const toggleTime = time => {
    if(timePeriodTypeList.includes(time)) setTimePeriodTypeList(timePeriodTypeList.filter(item => item !== time))
    else setTimePeriodTypeList([...timePeriodTypeList, time])
  }
  const closeTimeSelector = () => {
    searchEvents()
    setIsOpenTimeSelector(false)
  }

  const toggleLevel = level => {
    if(levelList.includes(level)) setLevelList(levelList.filter(item => item !== level))
    else setLevelList([...levelList, level])
  }
  const closeLevelSelector = () => {
    searchEvents()
    setIsOpenLevelSelector(false)
  }

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
  const searchEvents = async() => {
    const params = { date: date, isOpen: isOpen, timePeriodTypeList: timePeriodTypeList, levelList: levelList }
    const query = new URLSearchParams(params)

    let response =  await fetch("http://localhost:5000/search?"+query)
    const newEvents = await response.json()

    console.log("search with tennisbear API")

    setEvents(newEvents)
  }

  useEffect(() => {
    searchEvents()

  }, [date, isOpen])

  const fetchEventDetails = async() => {
    if(!events) return

    const ids = events
      .filter(event => showingEventIDs.includes(event.id))
      .filter(event => !("detail" in event))
      .map(event => event.id)

    if(ids.length === 0) return

    console.log("fetch Event details")
    const details = await Promise.all(
      ids.map(id => fetch("http://localhost:5000/events/" + id).then(res => res.json()))
    )

    // state更新
    const newEvents = events.map(event => {
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
  }, [pagination, showingEventIDs])

  useEffect(() => {
    let showingEvents = events.filter(event => !event.detail || priceRange[0] <= event.detail.priceOverview && event.detail.priceOverview <= priceRange[1])
    if(isExceptFifty) {
      showingEvents = showingEvents.filter(event => !event.detail || !event.detail.participantList || event.detail.participantList.every(participant => !participant.user.age || !(["50代", "60代", "70代"].includes(participant.user.age.name))))
    }

    const ids = showingEvents
      .slice((pagination.current-1) * pagination.pageSize, pagination.current * pagination.pageSize)
      .map(event => event.id)
    setShowingEventIDs(ids)
  }, [events, pagination, isExceptFifty, priceRange])

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
        else if(data === "非公開") return <div style={{fontSize: "10px"}}>非公開</div>
        else return (
          <div style={{flex: "left", display: "flex", fontSize: "10px"}}>
            {data.map(user =>
              <div style={{marginRight: "10px"}}>
                <div>{user.age ? user.age.name : "非公開"}</div>
                {
                  (!user.gender) ? <div>非公開</div>
                    : (user.gender.name === "男性") ? <div style={{color: "skyblue"}}>男性</div>
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
        if (event.detail === undefined) return <Spin/>
        else {
          const price = event.detail.priceOverview
          // 時間計算のため一時的に2023/1/1を入れている
          const startAt = dayjs("2023/01/01 " + event.datetime.split(' ')[1].split("-")[0])
          const endAt = dayjs("2023/01/01 " + event.datetime.split(' ')[1].split("-")[1])
          return price + "円 / " + Math.round(endAt.diff(startAt, "h", true) * 10) / 10 + "時間"
        }
      }
    }
  ]

  let data = events
    .map((event, index) => ({
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
        : event.detail.participantList.length === 0 ?
          "非公開"
          : event.detail.participantList.map(participant => participant.user)
    }))
    .filter(event => !event.detail || priceRange[0] <= event.detail.priceOverview && event.detail.priceOverview <= priceRange[1])

  if(isExceptFifty) {
    data = data.filter(event => !event.participants || event.participants === "非公開" || event.participants.every(user => !user.age || !(["50代", "60代", "70代"].includes(user.age.name))))
  }

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
        <div style={{margin: "30px"}}>
          <Row>
            <Col style={{maxWidth: "340px", marginRight: "10px"}}>
              <Row style={{marginBottom: "20px"}}>
                <Button type="primary" style={{"fontWeight": "bold", width: "130px"}}>東京都</Button>
              </Row>
              <Row style={{marginBottom: "20px"}}>
                <DatePicker
                  defaultValue={dayjs()}
                  format={'MM/DD'}
                  onChange={onChangeDate}
                  style={{width: "130px"}}
                />
              </Row>
              <Row style={{marginBottom: "20px"}}>
                <Button
                  type={isOpen ? "primary" : "default"}
                  onClick={onChangeIsOpen}
                  style={{width: "130px"}}
                >
                  募集中
                </Button>
              </Row>
              <Row style={{marginBottom: "20px"}}>
                <Button
                  type={timePeriodTypeList.length ? "primary" : "default"}
                  onClick={() => setIsOpenTimeSelector(true)}
                  style={{width: "130px"}}
                >
                  時間
                </Button>
                <Modal
                  open={isOpenTimeSelector}
                  onOk={closeTimeSelector}
                  onCancel={closeTimeSelector}
                >
                  <Row style={{marginBottom: "15px"}}>
                    <Button
                      type={timePeriodTypeList.includes("PERIOD_6_8") ? "primary" : "default"}
                      style={{width: "90px", marginRight: "10px"}}
                      onClick={() => toggleTime("PERIOD_6_8")}
                    >
                      6:00~
                    </Button>
                    <Button
                      type={timePeriodTypeList.includes("PERIOD_8_10") ? "primary" : "default"}
                      style={{width: "90px", marginRight: "10px"}}
                      onClick={() => toggleTime("PERIOD_8_10")}
                    >
                      8:00~
                    </Button>
                    <Button
                      type={timePeriodTypeList.includes("PERIOD_10_12") ? "primary" : "default"}
                      style={{width: "90px", marginRight: "10px"}}
                      onClick={() => toggleTime("PERIOD_10_12")}
                    >
                      10:00~
                    </Button>
                  </Row>
                  <Row style={{marginBottom: "15px"}}>
                    <Button
                      type={timePeriodTypeList.includes("PERIOD_12_14") ? "primary" : "default"}
                      style={{width: "90px", marginRight: "10px"}}
                      onClick={() => toggleTime("PERIOD_12_14")}
                    >
                      12:00~
                    </Button>
                    <Button
                      type={timePeriodTypeList.includes("PERIOD_14_16") ? "primary" : "default"}
                      style={{width: "90px", marginRight: "10px"}}
                      onClick={() => toggleTime("PERIOD_14_16")}
                    >
                      14:00~
                    </Button>
                    <Button
                      type={timePeriodTypeList.includes("PERIOD_16_18") ? "primary" : "default"}
                      style={{width: "90px", marginRight: "10px"}}
                      onClick={() => toggleTime("PERIOD_16_18")}
                    >
                      16:00~
                    </Button>
                  </Row>
                  <Row style={{marginBottom: "15px"}}>
                    <Button
                      type={timePeriodTypeList.includes("PERIOD_18_20") ? "primary" : "default"}
                      style={{width: "90px", marginRight: "10px"}}
                      onClick={() => toggleTime("PERIOD_18_20")}
                    >
                      18:00~
                    </Button>
                    <Button
                      type={timePeriodTypeList.includes("PERIOD_20_22") ? "primary" : "default"}
                      style={{width: "90px", marginRight: "10px"}}
                      onClick={() => toggleTime("PERIOD_20_22")}
                    >
                      20:00~
                    </Button>
                    <Button
                      type={timePeriodTypeList.includes("PERIOD_22_24") ? "primary" : "default"}
                      style={{width: "90px", marginRight: "10px"}}
                      onClick={() => toggleTime("PERIOD_22_24")}
                    >
                      22:00~
                    </Button>
                  </Row>
                </Modal>
              </Row>
              <Row style={{marginBottom: "20px"}}>
                <Button
                  type={levelList.length ? "primary" : "default"}
                  onClick={() => setIsOpenLevelSelector(true)}
                  style={{width: "130px"}}
                >
                  レベル
                </Button>
                <Modal
                  open={isOpenLevelSelector}
                  onOk={closeLevelSelector}
                  onCancel={closeLevelSelector}
                >
                  <Row style={{marginBottom: "15px"}}>
                    <Button
                      type={levelList.includes(1) ? "primary" : "default"}
                      style={{width: "120px", marginRight: "10px"}}
                      onClick={() => toggleLevel(1)}
                    >
                      Lv.1 はじめて
                    </Button>
                    <Button
                      type={levelList.includes(2) ? "primary" : "default"}
                      style={{width: "120px", marginRight: "10px"}}
                      onClick={() => toggleLevel(2)}
                    >
                      Lv.2 初心者
                    </Button>
                    <Button
                      type={levelList.includes(3) ? "primary" : "default"}
                      style={{width: "120px", marginRight: "10px"}}
                      onClick={() => toggleLevel(3)}
                    >
                      Lv.3 初級
                    </Button>
                  </Row>
                  <Row style={{marginBottom: "15px"}}>
                    <Button
                      type={levelList.includes(4) ? "primary" : "default"}
                      style={{width: "120px", marginRight: "10px"}}
                      onClick={() => toggleLevel(4)}
                    >
                      Lv.4 初中級
                    </Button>
                    <Button
                      type={levelList.includes(5) ? "primary" : "default"}
                      style={{width: "120px", marginRight: "10px"}}
                      onClick={() => toggleLevel(5)}
                    >
                      Lv.5 中級
                    </Button>
                    <Button
                      type={levelList.includes(6) ? "primary" : "default"}
                      style={{width: "120px", marginRight: "10px"}}
                      onClick={() => toggleLevel(6)}
                    >
                      Lv.6 中上級
                    </Button>
                  </Row>
                  <Row style={{marginBottom: "15px"}}>
                    <Button
                      type={levelList.includes(7) ? "primary" : "default"}
                      style={{width: "120px", marginRight: "10px"}}
                      onClick={() => toggleLevel(7)}
                    >
                      Lv.7 上級
                    </Button>
                    <Button
                      type={levelList.includes(8) ? "primary" : "default"}
                      style={{width: "120px", marginRight: "10px"}}
                      onClick={() => toggleLevel(8)}
                    >
                      Lv.8 超上級
                    </Button>
                    <Button
                      type={levelList.includes(9) ? "primary" : "default"}
                      style={{width: "120px", marginRight: "10px"}}
                      onClick={() => toggleLevel(9)}
                    >
                      Lv.9 プロ
                    </Button>
                  </Row>
                </Modal>
              </Row>
              <Row style={{marginBottom: "20px"}}>
                <Button
                  type={isExceptFifty ? "primary" : "default"}
                  onClick={toggleIsExceptFifty}
                  style={{width: "130px"}}
                >
                  50代以上を除く
                </Button>
              </Row>
              <Row>
                参加費
              </Row>
              <Row style={{marginBotom: "60px"}}>
                <Slider
                  range
                  max={5000}
                  step={100}
                  marks={{[priceRange[0]]:priceRange[0], [priceRange[1]]:priceRange[1]}}
                  defaultValue={priceRange}
                  style={{width: "130px"}}
                  onAfterChange={handleChangePriceRange}
                />
              </Row>
            </Col>

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
          </Row>
          {/*
            <row>
              <googlemap places={places} hoverindex={hoverindex}/>
            </row>
          */}
        </div>
      </ConfigProvider>
    </div>
  );
}

export default App;
