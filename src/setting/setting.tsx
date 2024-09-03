import React from 'react'
import { type AllWidgetSettingProps } from 'jimu-for-builder'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { getStyle } from './lib/style'

export default function Setting (props: AllWidgetSettingProps<{ [key: string]: never }>) {
  const onSelect = (useMapWidgetIds: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds
    })
  }

  return (
    <div>
      <div className="widget-setting">
        <SettingSection>
          <h6 className="setting-text-level-1">Map</h6>
          <label className="map-selector-section">
            <span className="text-break setting-text-level-3">Select the map widget:</span>
            <SettingRow>
              <MapWidgetSelector onSelect={onSelect} useMapWidgetIds={props.useMapWidgetIds}></MapWidgetSelector>
            </SettingRow>
          </label>
        </SettingSection>
      </div>
    </div>
  )
}
