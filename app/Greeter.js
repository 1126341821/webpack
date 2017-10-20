//Greeter,js
import React, {
	Component
} from 'react'
import config from './config.json';
import styles from './Greeter.scss'; //导入

class Greeter extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: ''
		};
	}
	request(url, method) {
		fetch(url, {
			method: method,
			mode: "no-cors",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			}
		}).then(function(res) {
			console.log("Response succeeded?", JSON.stringify(res.ok));
			console.log(JSON.stringify(res));
		}).catch(function(e) {
			console.log("fetch fail", JSON.stringify(params));
		});
	}
	jsonpCallback(result) {
		this.data = result;
	}
	click() {
		const url = "http://localhost:8081/tao";
		this.request(url, "GET");
	}
	render() {
			const {
				value
			} = this.state;
			console.log(this.state);
			return(
					<div>
				<div className={styles.root} onClick={this.click.bind(this)}>//添加类名
			        {config.greetText}
			    </div> 
 <div >{value} < /div>
			< /div>
		);
	}
}

export default Greeter