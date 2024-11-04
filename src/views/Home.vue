<template>
  <div class="main">
    <div class="fade map-panel py-2 px-5">
      <div>
        <label>
          trace:
          <select v-model="traceState">
            <option value="via">Via</option>
            <option value="arrive">Arrive</option>
            <option value="clear">Clear</option>
          </select>
        </label>
      </div>
      <button
        @click="downloadGeoJSON"
        class="bg-blue-900 text-white board rounded-md px-2 mt-2"
      >
        保存 GeoJSON
      </button>
    </div>
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import shp from 'shpjs'
import { featureCollection as featureCollectionHelper } from '@turf/helpers'

const mapContainer = ref(null)
const visitedColor = ref('#d05347')
const fillColor = ref('#fff')
const viaColor = ref('#f3d1cf')
const traceState = ref('arrive')

let ArrivalFeature = []
let ViaFeature = []

onMounted(async () => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWVuZ3hpbjAwMSIsImEiOiJja2Q2MmVzMjkwZ3BwMndwZzdoajlrbXgwIn0.LkCmyt-_LmdfpTBkU3fEMQ'

  const map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mengxin001/clv9iwi3600qb01qv9v3d23na',
    center: [104.1954, 35.8617],
    zoom: 4,
    language: 'zh',
  })

  const city_shp = await shp('./2023City.zip')
  const pro_shp = await shp('./2023Pro.zip')
  const addMultiPolygonName = (geojsonData) => {
    let features = JSON.parse(JSON.stringify(geojsonData.features)),
      nameCoordinatesArray = []

    for (let i = 0; i < features.length; i++) {
      let properties = features[i].properties
      let nameLngLat = {
        name: properties.地名,
        lnglat: properties.centroid || properties.center,
      }
      nameCoordinatesArray.push(nameLngLat)
    }

    for (let i = 0; i < nameCoordinatesArray.length; i++) {
      const item = nameCoordinatesArray[i]
      const nameDiv = document.createElement('div')
      nameDiv.className = 'polygonName'
      nameDiv.innerHTML = item.name

      new mapboxgl.Marker(nameDiv).setLngLat(item.lnglat).addTo(this.map)
    }
  }
  map.on('load', () => {
    // cities-trace-source
    map.addSource('china-cities', {
      type: 'geojson',
      data: city_shp,
    })

    map.addLayer({
      id: 'city-layer',
      type: 'fill',
      source: 'china-cities',
      paint: {
        'fill-color': fillColor.value,
        'fill-opacity': 0.6,
      },
    })

    map.addLayer({
      id: 'city-boundary',
      type: 'line',
      source: 'china-cities',
      paint: {
        'line-color': '#5f5f5f',
        'line-width': 0.8,
      },
    })

    // province-source
    map.addSource('china-provinces', {
      type: 'geojson',
      data: pro_shp,
    })

    map.addLayer({
      id: 'province-layer',
      type: 'fill',
      source: 'china-provinces',
      paint: {
        'fill-color': fillColor.value,
        'fill-opacity': 0,
      },
    })

    map.addLayer({
      id: 'province-boundary',
      type: 'line',
      source: 'china-provinces',
      paint: {
        'line-color': '#89785f',
        'line-width': 1.5,
      },
    })

    // arrival-trace-source
    map.addSource('trace-source', {
      type: 'geojson',
      data: null,
    })
    map.addLayer({
      id: 'trace-layer',
      type: 'fill',
      source: 'trace-source',
      paint: {
        'fill-color': visitedColor.value,
        'fill-opacity': 1,
      },
    })
    map.addLayer({
      id: 'trace-boundary-layer',
      type: 'line',
      source: 'trace-source',
      paint: {
        'line-color': '#5f5f5f',
        'line-width': 1,
      },
    })
    // via-trace-source
    map.addSource('via-trace-source', {
      type: 'geojson',
      data: null,
    })
    map.addLayer({
      id: 'via-trace-layer',
      type: 'fill',
      source: 'via-trace-source',
      paint: {
        'fill-color': viaColor.value,
        'fill-opacity': 1,
      },
    })
    map.addLayer({
      id: 'via-trace-boundary-layer',
      type: 'line',
      source: 'via-trace-source',
      paint: {
        'line-color': '#775855',
        'line-width': 1,
      },
    })
    // 绘制
    map.on('click', 'city-layer', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['city-layer'],
      })
      if (features.length) {
        let feature = features[0]
        console.log(feature)
        if (traceState.value === 'arrive') {
          ArrivalFeature.push(feature)
          map
            .getSource('trace-source')
            .setData(featureCollectionHelper(ArrivalFeature))
        } else if (traceState.value === 'via') {
          ViaFeature.push(feature)
          map
            .getSource('via-trace-source')
            .setData(featureCollectionHelper(ViaFeature))
        }
      }
    })
    // 撤销
    // trace-layer
    map.on('click', 'trace-layer', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['trace-layer'],
      })
      if (features.length) {
        let feature = features[0]
        if (traceState.value === 'clear') {
          ArrivalFeature = ArrivalFeature.filter(
            (item) => item.properties.code !== feature.properties.code,
          )
          map
            .getSource('trace-source')
            .setData(featureCollectionHelper(ArrivalFeature))
        }
      }
    })
    // via-trace-layer
    map.on('click', 'via-trace-layer', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['via-trace-layer'],
      })
      if (features.length) {
        let feature = features[0]
        if (traceState.value === 'clear') {
          ViaFeature = ViaFeature.filter(
            (item) => item.properties.code !== feature.properties.code,
          )
          map
            .getSource('via-trace-source')
            .setData(featureCollectionHelper(ViaFeature))
        }
      }
    })
  })
})
const downloadGeoJSON = () => {
  let geojson
  if (traceState.value === 'arrive') {
    geojson = featureCollectionHelper(ArrivalFeature)
  } else if (traceState.value === 'via') {
    geojson = featureCollectionHelper(ViaFeature)
  }
  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = traceState.value + '.geojson'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style lang="scss">
.map-container {
  height: 100vh;
  width: 100%;
}

.main {
  display: flex;
  position: relative;
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;

  .map-panel {
    min-width: 150px;
    flex-direction: column;
    display: flex;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  }
}
</style>
