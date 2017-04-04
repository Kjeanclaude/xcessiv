import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';


class SplitForm extends Component {
  render() {

    return (
      <div>
        <p>You have chosen to split off a test dataset from the main dataset</p>
        <div className='SplitFormLabel'>
          <label>
            Test Dataset Ratio:
            <input name='ratioValue' type='number' step='0.001' min='0' max='1' value={this.props.split_ratio} onChange={this.props.onSplitFormChange}/>
          </label>
        </div>
        <div className='SplitFormLabel'>
          <label>
            Random Seed:
            <input name='seedValue' type='number' value={this.props.split_seed} onChange={this.props.onSplitFormChange}/>
          </label>
        </div>
      </div>
    )
  }
}

SplitForm.defaultProps = {
  split_ratio: 0.33,
  split_seed: 8
};


class TestDataExtraction extends Component {
  constructor(props) {
    super(props);
    this.state = {config: {
    	"method": null
      },
      same: true
	};
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.saveSetup = this.saveSetup.bind(this);
    this.onSplitFormChange = this.onSplitFormChange.bind(this);
  }

  handleOptionChange(event) {
    var new_option = event.target.value;

    // special case since radiobutton value can't be null
    if (new_option === 'NONE') {
      new_option = null;
    }

    var newConfig = JSON.parse(JSON.stringify(this.state.config));
    newConfig.method = new_option;
    console.log(event.target.value);
    console.log(isEqual(newConfig, this.savedConfig))
    this.setState({
      config: newConfig,
      same: isEqual(newConfig, this.savedConfig)
    })
  }

  onSplitFormChange(event) {
    const target = event.target;
    const name = target.name;

    var newConfig = JSON.parse(JSON.stringify(this.state.config));
    if (name === 'ratioValue') {
      newConfig.split_ratio = parseFloat(target.value);
    }
    else {
      newConfig.split_seed = parseInt(target.value, 10);
    }

    this.setState({
      config: newConfig,
      same: isEqual(newConfig, this.savedConfig)
    })
  }

  saveSetup() {
    var payload = this.state.config;

    fetch(
      '/ensemble/extraction/test-dataset/?path=' + this.props.path,
      {
      	method: "PATCH",
      	body: JSON.stringify( payload ),
      	headers: new Headers({
      	  'Content-Type': 'application/json'
      	})
      })
      .then(response => response.json())
      .then(json => {
	  	console.log(json)
	  	this.savedConfig = json
	    this.setState({
	      config: json,
	      same: true
	    })
	  });
  }

  componentDidMount() {
  	fetch('/ensemble/extraction/test-dataset/?path=' + this.props.path)
	  .then(response => response.json())
	  .then(json => {
	  	console.log(json)
	  	this.savedConfig = json
	    this.setState({
	      config: json,
	      same: true
	    })
	  });
  }

  render() {

  	return <div className='MainDataExtraction'>
  	  <h2> Test Dataset Extraction Setup {!this.state.same && '*'}</h2>
  	  <h3> Test Dataset Extraction Method </h3>
      <div onChange={this.setMethod}>
        <input type='radio' value="NONE" 
        name="method"
        checked={this.state.config.method === null}
        onChange={this.handleOptionChange}/> No test dataset
        <input type='radio' value="split_from_main" 
        name="method" 
        checked={this.state.config.method === 'split_from_main'}
        onChange={this.handleOptionChange}/> Split from main dataset
        <input type='radio' value="source" 
        name="method"
        checked={this.state.config.method === 'source'}
        onChange={this.handleOptionChange}/> Extract with source code
      </div>
      {this.state.config.method === 'split_from_main' && 
        <SplitForm split_ratio={this.state.config.split_ratio} 
        split_seed={this.state.config.split_seed} 
        onSplitFormChange={this.onSplitFormChange}/>
      }
      <button disabled={this.state.same} onClick={this.saveSetup}> Save Test Dataset Extraction Setup </button>
  	</div>
  }
}

export default TestDataExtraction;