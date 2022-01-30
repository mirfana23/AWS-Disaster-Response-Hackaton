import axios from 'axios'
import React from 'react'
import './banjeerapp.css'
import './safebutton.css'

class SafeButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      disabled  : false
    }
  }
  onClick = () => {
    this.setState({
      disabled  : true
    })
    this.props.onClick()
    .then((res) => {
      this.enable()
    })
    .catch((err) => {
      this.enable()
    })
  }
  enable = () => {
    this.setState({
      disabled  : false
    })
  }
  disable = () => {
    this.setState({
      disabled  : true
    })
  }
  render(){
    const {children, onClick, className, ...other}   = this.props
    return(
      <button onClick = {this.onClick} className = {`safebutton ${className}`} {...other} disabled = {this.state.disabled}>
        {children}
      </button>
    )
  }
}

export default class BanjeerApp extends React.Component{
  constructor(props){
    super(props)
    this.state  = {
      file_form   : {
        value   : null, 
        warn    : ''
      }, 
      file_process: false, 
      img_preview : null,
      img_result  : null, 
      loading     : false,
      magic_words : 'Doing some magic...'
    }
  }
  componentWillUnmount(){
    URL.revokeObjectURL(this.state.img_preview)
  }
  uploadFile = (event) => {
    this.setState({
      file_form : {
        value   : event.target.files[0], warn : ''
      },
      img_preview : URL.createObjectURL(event.target.files[0])
    })
  }
  submitFile = () => {
    return new Promise((res, rej) => {
      if(this.state.file_form.value === null){
        this.setState({
          file_form : {
            value : null, warn : 'No file is uploaded'
          }
        })
        throw new Error("Lol")
      }
      this.setState({
        file_process : true, img_result : null, loading : true, magic_words : 'Doing some magic...'
      })
      const load  = new FormData()
      load.append('image', this.state.file_form.value, this.state.file_form.value.name)
      let baseUrl   = process.env.REACT_APP_API_ENDPOINT !== undefined ? process.env.REACT_APP_API_ENDPOINT : 'http://localhost:8000/api'
      let url       = `${baseUrl}/upload/`
      axios.post(url, load, {responseType : 'blob'})
      .then((resp) => {
        console.log(resp)
        let blob  = new Blob([resp.data])
        console.log(blob)
        let url   = URL.createObjectURL(blob)
        console.log(url)
        this.setState({
          img_result : url, loading : false
        })
        res()
      })
      .catch((err) => {
        if(err && err.response && err.response.status){
          if(err.response.status === 413) this.setState({magic_words : 'Magic failed as file is too large'})
          if(err.response.status === 500) this.setState({magic_words : 'Magic Failed as the wizard is taking a rest'})
        }
        else{
          this.setState({magic_words : 'Magic failed as the wizard is resting'})
        }
      })
    })
  }
  render(){
    return(
      <section className = 'banjeer-container'>
        <div className = 'banjeer-upload'>
          <div className = 'banjeer-upload-form'>
            <div className = 'banjeer-upload-title'>
              <p>File Upload</p>
            </div>
            <div className = 'banjeer-upload-input'>
              <div className = 'banjeer-upload-file'>
                <input type = 'file' onChange = {this.uploadFile} accept = 'image/*'/>
                <p className = 'warn'>{this.state.file_form.warn}</p>
              </div>
              <div className = 'banjeer-upload-submit'>
                <SafeButton onClick = {this.submitFile}>Submit File</SafeButton>
              </div>
            </div>
          </div>
          <div className = 'help-text'>
            <p>Upload a river image and the image will be annotated with colors showing the condition of the river. 
                  Size does not really matter however, the ML model will resize the image to 512 x 512. Hence, 
                  it is a good idea to crop the image beforehand. 
            </p>
          </div>
          <div className = 'banjeer-prev-title'>
            <p>Preview Image</p>
          </div>
          <div className = 'banjeer-prev-img' key = {this.state.img_preview}>
            <img src = {this.state.img_preview}/>
          </div>
        </div>
        <div className = 'banjeer-container-result'>
          <div className = 'banjeer-result-title'>
            <p>Annotation Result</p>
          </div>
          <div className = 'banjeer-help'>
            <div className = 'banjeer-help-block'>
              <div className = 'banjeer-color green'>
              </div>
              <div className = 'banjeer-color-title'>
                <p>River is in very good condition</p>
              </div>
            </div>
            <div className = 'banjeer-help-block'>
              <div className = 'banjeer-color yellow'>
              </div>
              <div className = 'banjeer-color-title'>
                <p>Moderate river quality</p>
              </div>
            </div>
            <div className = 'banjeer-help-block'>
              <div className = 'banjeer-color red'>
              </div>
              <div className = 'banjeer-color-title'>
                <p>River is in a very bad shape</p>
              </div>
            </div>
          </div>
          {this.state.loading ? 
          <div className = 'banjeer-loading'>
            <p>{this.state.magic_words}</p>
          </div>
          :
          <div key = {this.state.file_process} className = {`banjeer-result-image ${this.state.file_process ? 'show' : 'hide'}`}>
            <div className = 'banjeer-img'>
              <img src = {this.state.img_result}/>
            </div>
          </div>}
        </div>
      </section>
    )
  }
}