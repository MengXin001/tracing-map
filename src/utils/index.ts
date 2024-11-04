import axios, { AxiosResponse } from 'axios'

export const callBackend = (api: string): Promise<AxiosResponse<any>> => {
  return axios.get(api)
}

const addMultiPolygonName = (geojsonData) => {
  let features = JSON.parse(JSON.stringify(geojsonData.features)),
    nameCoordinatesArray = []

  for (let i = 0; i < features.length; i++) {
    let properties = features[i].properties
    let nameLngLat: nameLngLat = {
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
