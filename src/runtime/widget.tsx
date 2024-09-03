/** @jsx jsx */
/*
  Radio Layers
  By Dave Highness, Trust for Public Land, 8/2024
  For Experience Builder Developer Edition 1.15
*/
import { type AllWidgetProps, jsx } from 'jimu-core'
import { useState } from 'react'
import { JimuMapView, JimuMapViewComponent, JimuLayerView } from 'jimu-arcgis'
import { Radio, Label, Switch } from 'jimu-ui'
import Legend from 'esri/widgets/Legend'
import { type IMConfig } from '../config'
import { getStyle } from './lib/style'

interface LayInfo {
  type:string;
  layId:string;
  subLayId?:string;
  title:string;
  radioId:string;
}

export default function (props: AllWidgetProps<IMConfig>) {
  const [layInfos, setLayInfos] = useState<LayInfo[]>(null)
  const [mapLayers, setMapLayers] = useState<JimuLayerView[]>(null)
  const [selectedLayer, setSelectedLayer] = useState<string>(null)
  const [lgnd, setLegend] = useState<Legend>(null)
  const [lgndVisible, setLgndVisible]= useState<boolean>(true)

  const activeViewChangeHandler = async (jmv: JimuMapView) => {
    await jmv.whenAllJimuLayerViewLoaded()
    if (jmv) {
      createSelectList(jmv.getAllJimuLayerViews())
      createLegend(jmv.view)
    }
  }

  const createLegend = (view:any) => {
    if (!lgnd){
      const viewlgnd = new Legend({
        view: view,
        visible: true
      })
      view.ui.add(viewlgnd, {
        position: "bottom-left"
      })
      setLegend(viewlgnd)
    }
  }

  // Creating a list of layers in the Select menu
  const createSelectList = async (mapServices:JimuLayerView[]) => {
    setMapLayers(mapServices)
    const layInfoList:LayInfo[] = []

    mapServices.forEach((mapService:JimuLayerView,idx) => {
      //console.log(idx,mapService.layer.title)
      
      if (mapService.layer.type === "feature" || mapService.layer.type === "imagery"){
        //console.log(mapService.layer)
        const radId:string = mapService.layer.type+"_"+mapService.layer.id
        const newLay:LayInfo = {
          type: mapService.layer.type,
          layId: mapService.layer.id,
          title: mapService.layer.title,
          radioId: radId
        }
        if (idx === 0){
          //newLay.visible = true
          mapService.layer.visible = true
          setSelectedLayer(radId)
        }
        else{
          mapService.layer.visible = false
        }
        layInfoList.push(newLay)
        //console.log(mapService.layer)
      }
      else if (mapService.layer.type === "map-image") {
        // Set map image service visible
        if (idx === 0){
          mapService.layer.visible = true
        }
        else {
          mapService.layer.visible = false
        }

        // All sublayers defined services
        mapService.layer.allSublayers.forEach((sublayer: any, idz) => {
          // Exclude group layers from list and make sure they are visible
          if (sublayer.sourceJSON.type === "Group Layer"){
            sublayer.visible = false
          }
          else {
            const radId:string = mapService.layer.type+"_"+mapService.layer.id+"_"+sublayer.id
            const newLay:LayInfo = {
              type: mapService.layer.type,
              layId: mapService.layer.id,
              subLayId: sublayer.id,
              title: sublayer.title,
              radioId: radId
            }
            if (idx === 0 && idz === 0){
              sublayer.visible = true
              setSelectedLayer(radId)
            }
            else {
              sublayer.visible = false
            }

            layInfoList.push(newLay)
          }
        })
      }
    })

    setLayInfos(layInfoList)
    //console.log(layInfoList)
  }

  const findLayInfo = (radioId:string) => {
    let findLay:LayInfo = null
    layInfos.forEach((lay) => {
      if (lay.radioId === radioId){
        findLay = lay
      }
    })
    return findLay
  }

  const setLayVis = (layInf:LayInfo) => {
    //Set visibility in map layer view
    mapLayers.forEach((mapLayer:JimuLayerView) => {
      if (mapLayer.layer.type === "feature" || mapLayer.layer.type === "imagery"){
        if (mapLayer.layer.id === layInf.layId){
          mapLayer.layer.visible = true
          //console.log(mapLayer.layer)
        }
        else {
          mapLayer.layer.visible = false
        }
      }
      else if (mapLayer.layer.type === "map-image") {
        if (mapLayer.layer.id === layInf.layId){
          mapLayer.layer.visible = true
          //console.log(mapLayer.layer)
        }
        else {
          mapLayer.layer.visible = false
        }
        mapLayer.layer.allSublayers.forEach((sublayer: any) => {
          // Exclude group layers from list and make sure they are visible
          if (sublayer.sourceJSON.type === "Group Layer"){
            sublayer.visible = true
            //console.log(mapLayer.layer)
          }
          else {
            if (sublayer.id === layInf.subLayId){
              sublayer.visible = true
            }
            else {
              sublayer.visible = false
            }
          }
        })
      }
    })
  }

  // After selecting the sublayer
  const onSelectLayer = (e: any) => {
    const tgv:string = e.target.value
    let layInf:LayInfo = findLayInfo(tgv)
    setSelectedLayer(layInf.radioId)
    //console.log(tgv,layInf)

    if (layInf){
      setLayVis(layInf)
    }
  }

  const onToggleLgndVisible = (e: any) => {
    setLgndVisible(e.target.checked)
    lgnd.visible = !lgndVisible
  }

  // Render
  return (
    <div css={getStyle(props.theme)} className="jimu-widget">
      {props.hasOwnProperty('useMapWidgetIds') &&
      props.useMapWidgetIds &&
      props.useMapWidgetIds.length === 1 && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds?.[0]}
          onActiveViewChange={activeViewChangeHandler}
        />
      )}
      <div className="widget-body">
        <div className='header-container'>
          <div className='header-title'>Web Map Layer Toggle</div>
          <div>
            <Switch className='toggle-visibility'
              checked={lgndVisible}
              onChange={onToggleLgndVisible}>
            </Switch>
            <span className="header-legend">Legend</span>
          </div>
        </div>
        <div className="body-radio-group">
          {layInfos
            ? layInfos.map(layer => (
              <Label for={layer.radioId} key={layer.radioId} className="radio-box">
                  <Radio name="vislays" id={layer.radioId} value={layer.radioId} onChange={onSelectLayer} checked={selectedLayer === layer.radioId}></Radio>
                  <div className="radio-label">{layer.title}</div>
              </Label>
            ))
            : ''
          }
        </div>
      </div>
    </div>
  )
}
