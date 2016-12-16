import React from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import { Card, CardMedia, CardTitle } from 'material-ui/Card'
import Checkbox from 'material-ui/Checkbox'
import Snackbar from 'material-ui/Snackbar'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import hljs from 'highlight.js'
import TextField from 'material-ui/TextField'
import vs from 'highlight.js/styles/vs.css'
import Clipboard from 'clipboard'
import ReactGA from 'react-ga'
import jsBeautify from 'js-beautify'
import config from './config'
import './HomeView.scss'

const items = []
config.languageItemsValue.forEach((val) => {
  items.push(<MenuItem value={val[0]} key={val[1]} primaryText={`${val[2]}`} />)
})

const templateItems = []
config.templateItemsValue.forEach((val) => {
  templateItems.push(<MenuItem value={val[1]} key={val[0]} primaryText={`${val[0]}`} />)
})

export default class DropDownMenuLongMenuExample extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      selectedLanguage: 'autodetect',
      selectedTemplate: 'vs',
      sourceCode: '',
      destCode: '',
      disabledClipboard: true,
      open: false,
      autoFormat: true,
      disabledAutoFormat: true
    }
    hljs.initHighlightingOnLoad()
  }

  handleChangeLanguage = (event, index, value) => {
    this.setState({ disabledAutoFormat: true, selectedLanguage: value })
    for (let format of config.formatLibrary) {
      if (format[0] === value) {
        this.setState({ disabledAutoFormat: false, selectedLanguage: value })
        break
      }
    }

    ReactGA.event({
      category: 'selectedLanguage',
      action: value
    })
  }
  handleChangeAutoFormat = (event, isInputChecked) => {
    this.setState({ autoFormat: isInputChecked })
    ReactGA.event({
      category: 'autoFormat',
      action: isInputChecked.toString()
    })
  }
  handleChangeTemplate = (event, index, value) => {
    this.setState({ selectedTemplate: value })
    let url = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.7.0/styles/' + value + '.min.css'
    if (document.createStyleSheet) {
      document.createStyleSheet(url)
    } else {
      var styles = "@import url('" + url + "')"
      var newSS = document.createElement('link')
      newSS.rel = 'stylesheet'
      newSS.href = 'data:text/css,' + escape(styles)
      document.getElementsByTagName('head')[0].appendChild(newSS)
    }
    ReactGA.event({
      category: 'selectedTemplate',
      action: value
    })
  }

  handleRequestClose = () => {
    this.setState({
      open: false
    })
  };

  onSourceChange = (ev) => {
    this.setState({ sourceCode: ev.target.value })
  }

  keydownHandler (e) {
    if (e.keyCode === 13 && e.ctrlKey) { // Ctrl+Enter
      this.onSourceClick(null)
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.keydownHandler.bind(this))
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.keydownHandler.bind(this))
  }

  onSourceClick = (ev) => {
    this.setState({ destCode: this.state.sourceCode, disabledClipboard: false })
    if (this.state.autoFormat) {
      for (let format of config.formatLibrary) { // Check the format library
        if (format[0] === this.state.selectedLanguage) {
          if (format[1] === 'js-beautify-js') {
            this.setState({
              destCode: jsBeautify.js_beautify(this.state.sourceCode, { indent_size: 4 }),
              disabledClipboard: false
            })
            break
          } else if (format[1] === 'js-beautify-html') {
            this.setState({
              destCode: jsBeautify.html_beautify(this.state.sourceCode, { indent_size: 4 }),
              disabledClipboard: false
            })
            break
          } else if (format[1] === 'js-beautify-css') {
            this.setState({
              destCode: jsBeautify.css_beautify(this.state.sourceCode, { indent_size: 4 }),
              disabledClipboard: false
            })
            break
          }
        }
      }
    }

    var codepreview = document.querySelector('#codepreview')
    codepreview.style.display = 'block'
    var clipboard = new Clipboard('#copytoclipboard')
    let $this = this

    clipboard.on('success', function (e) {
      $this.setState({
        open: true
      })
      e.clearSelection()

      ReactGA.event({
        category: 'copyToClipboard',
        action: 'copyToClipboard'
      })
    })

    ReactGA.event({
      category: 'highLight',
      action: 'highLight'
    })

    var code = document.querySelector('#code') // remove old class first.
    code.removeAttribute('class')
    code.className = 'hljs'
    // set language class to code
    if (this.state.selectedLanguage !== 'auto' && this.state.selectedLanguage !== 'autodetect') {
      code.classList.add(this.state.selectedLanguage)
    }

    setTimeout(() => {
      var code = document.querySelector('#code')
      hljs.highlightBlock(code)
    }, 300)
  };

  render () {
    return (
      <div>
        <Card id='titlecard' style={{ padding:'0px' }}>
          <CardMedia id='titlecardmedia'
            overlay={<CardTitle title='Online syntax highlight'
              subtitle='Source code beautifier for the coder!'
              style={{ paddingTop:null }} />}
            style={{ paddingTop:null }}
          >
            <img src='code.jpg' style={{ maxHeight:'200px', minHeight:'80px' }} />
          </CardMedia>
        </Card>
        <div style={{ float: 'left', width: '100%' }}>
          <div style={{ float: 'left', minWidth:'220px' }}>
            Language:<DropDownMenu maxHeight={300} value={this.state.selectedLanguage}
              onChange={this.handleChangeLanguage}>
              {items}
            </DropDownMenu>
          </div>
          <div style={{ float: 'left', minWidth:'220px' }}>
          Template: <DropDownMenu maxHeight={300} value={this.state.selectedTemplate}
            onChange={this.handleChangeTemplate}>
            {templateItems}
          </DropDownMenu>
          </div>
          <div style={{ float: 'left', minWidth: '220px', margin:'auto auto' }}>
            <Checkbox
              label='Auto Format (JavaScript, JSON, CSS, HTML, XML)'
              checked={this.state.autoFormat}
              disabled={this.state.disabledAutoFormat}
              labelStyle={{ width:'100%' }}
              style={{ paddingTop:'12px' }}
              onCheck={this.handleChangeAutoFormat}
            />
          </div>
        </div>
        <div
          style={{ width: 100 + '%', float: 'left', 'minWidth': '320px' }}>
          <TextField
            hintText=''
            floatingLabelStyle={{ color: 'rgb(0,188,212)' }}
            floatingLabelText='Source code:'
            multiLine
            rows={5}
            rowsMax={10}
            onChange={this.onSourceChange}
            fullWidth
          />
          <br />
          <div style={{ margin: 'auto auto', 'textAlign': 'center' }}>
            <RaisedButton label='Highlight' primary
              onClick={this.onSourceClick} style={{ 'textAlign': 'center' }} />
            <RaisedButton label='Copy to clipboard' id='copytoclipboard' secondary
              style={{ 'textAlign': 'center', 'marginLeft': '10px' }} disabled={this.state.disabledClipboard}
              data-clipboard-target='#code' />
          </div>
        </div>
        <div id='codepreview'
          style={{ width: 100 + '%', paddingTop:'10px', float: 'left', 'minWidth': '320px', display: 'none' }}>
          Highlighted code: You can copy the code into Microsoft Word or Email:
          <pre><code id='code' className={vs}>{this.state.destCode}
          </code></pre>
        </div>
        <Snackbar
          open={this.state.open}
          message='Copied!'
          autoHideDuration={2000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    )
  }
}
