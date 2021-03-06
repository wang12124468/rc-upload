import _extends from 'babel-runtime/helpers/extends';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
/* eslint react/no-is-mounted:0 react/sort-comp:0 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import defaultRequest from './request';
import getUid from './uid';

var AjaxUploader = function (_Component) {
  _inherits(AjaxUploader, _Component);

  function AjaxUploader() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, AjaxUploader);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = AjaxUploader.__proto__ || Object.getPrototypeOf(AjaxUploader)).call.apply(_ref, [this].concat(args))), _this), _this.state = { uid: getUid() }, _this.reqs = {}, _this.onChange = function (e) {
      var files = e.target.files;
      _this.uploadFiles(files);
      _this.reset();
    }, _this.onClick = function () {
      var el = _this.refs.file;
      if (!el) {
        return;
      }
      el.click();
    }, _this.onKeyDown = function (e) {
      if (e.key === 'Enter') {
        _this.onClick();
      }
    }, _this.onDropOver = function (e) {
      if (e.type === 'dragover') {
        e.preventDefault();
        return;
      }
    }, _this.onDrop = function (e) {
      if (_this.props.disabled) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      var files = e.dataTransfer.files;
      _this.uploadFiles(files);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(AjaxUploader, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._isMounted = true;
      this.tag.addEventListener('drop', this.onDrop, false);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._isMounted = false;
      this.abort();
      this.tag.document.removeEventListener('drop', this.onDrop, false);
    }
  }, {
    key: 'uploadFiles',
    value: function uploadFiles(files) {
      var postFiles = Array.prototype.slice.call(files);
      var len = postFiles.length;
      for (var i = 0; i < len; i++) {
        var file = postFiles[i];
        file.uid = getUid();
        this.upload(file, postFiles);
      }
    }
  }, {
    key: 'upload',
    value: function upload(file, fileList) {
      var _this2 = this;

      var props = this.props;

      if (!props.beforeUpload) {
        // always async in case use react state to keep fileList
        return setTimeout(function () {
          return _this2.post(file);
        }, 0);
      }

      var before = props.beforeUpload(file, fileList);
      if (before && before.then) {
        before.then(function (processedFile) {
          var processedFileType = Object.prototype.toString.call(processedFile);
          if (processedFileType === '[object File]' || processedFileType === '[object Blob]') {
            _this2.post(processedFile);
          } else {
            _this2.post(file);
          }
        })['catch'](function (e) {
          console && console.log(e); // eslint-disable-line
        });
      } else if (before !== false) {
        setTimeout(function () {
          return _this2.post(file);
        }, 0);
      }
    }
  }, {
    key: 'post',
    value: function post(file) {
      var _this3 = this;

      if (!this._isMounted) {
        return;
      }
      var props = this.props;
      var data = props.data;
      var onStart = props.onStart,
          onProgress = props.onProgress;

      if (typeof data === 'function') {
        data = data(file);
      }
      var uid = file.uid;

      var request = props.customRequest || defaultRequest;
      this.reqs[uid] = request({
        action: props.action,
        filename: props.name,
        file: file,
        data: data,
        headers: props.headers,
        withCredentials: props.withCredentials,
        onProgress: onProgress ? function (e) {
          onProgress(e, file);
        } : null,
        onSuccess: function onSuccess(ret, xhr) {
          delete _this3.reqs[uid];
          props.onSuccess(ret, file, xhr);
        },
        onError: function onError(err, ret) {
          delete _this3.reqs[uid];
          props.onError(err, ret, file);
        }
      });
      onStart(file);
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.setState({
        uid: getUid()
      });
    }
  }, {
    key: 'abort',
    value: function abort(file) {
      var reqs = this.reqs;

      if (file) {
        var uid = file;
        if (file && file.uid) {
          uid = file.uid;
        }
        if (reqs[uid]) {
          reqs[uid].abort();
          delete reqs[uid];
        }
      } else {
        Object.keys(reqs).forEach(function (uid) {
          if (reqs[uid]) {
            reqs[uid].abort();
          }

          delete reqs[uid];
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _classNames,
          _this4 = this;

      var _props = this.props,
          Tag = _props.component,
          prefixCls = _props.prefixCls,
          className = _props.className,
          disabled = _props.disabled,
          style = _props.style,
          multiple = _props.multiple,
          accept = _props.accept,
          children = _props.children;

      var cls = classNames((_classNames = {}, _defineProperty(_classNames, prefixCls, true), _defineProperty(_classNames, prefixCls + '-disabled', disabled), _defineProperty(_classNames, className, className), _classNames));
      var events = disabled ? {} : {
        onClick: this.onClick,
        onKeyDown: this.onKeyDown,
        // onDrop: this.onFileDrop,
        onDragOver: this.onDropOver,
        tabIndex: '0'
      };
      return React.createElement(
        Tag,
        _extends({}, events, {
          className: cls,
          role: 'button',
          style: style,
          ref: function ref(_ref2) {
            return _this4.tag = _ref2;
          }
        }),
        React.createElement('input', {
          type: 'file',
          ref: 'file',
          key: this.state.uid,
          style: { display: 'none' },
          accept: accept,
          multiple: multiple,
          onChange: this.onChange
        }),
        children
      );
    }
  }]);

  return AjaxUploader;
}(Component);

AjaxUploader.propTypes = {
  component: PropTypes.string,
  style: PropTypes.object,
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  accept: PropTypes.string,
  children: PropTypes.any,
  onStart: PropTypes.func,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  headers: PropTypes.object,
  beforeUpload: PropTypes.func,
  customRequest: PropTypes.func,
  onProgress: PropTypes.func,
  withCredentials: PropTypes.bool
};


export default AjaxUploader;