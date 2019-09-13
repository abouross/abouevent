/**
 * Created by abou on 08/06/17.
 */
angular.module('AbouEventAdmin')
    .directive('abImagePicker', AbImagePicker);

function AbImagePicker($mdUtil, $mdAria, inputDirective, BaseUrl, _) {

    function ImagePickerCtrl($scope, $attrs, AbImageSelect) {
        this.scope = $scope;
        this.attrs = $attrs;
        this.disabled = false;
        this.mdInputContainer = null;
        this.ngModelCtrl = null;
        this.progress = false;
        this.dialog = AbImageSelect;
    }

    ImagePickerCtrl.prototype.init = function (multiple, required) {
        this.multiple = multiple;
        this.required = required;
        this.selected = multiple ? [] : null;
    };
    ImagePickerCtrl.prototype.configureNgModel = function (ngModelCtrl, mdInputContainer, inputDirective) {
        this.ngModelCtrl = ngModelCtrl;
        this.mdInputContainer = mdInputContainer;

        inputDirective[0].link.pre(this.scope, {
            on: angular.noop,
            val: angular.noop,
            0: {}
        }, this.attrs, [ngModelCtrl]);

        var self = this;

        // Responds to external changes to the model value.
        self.ngModelCtrl.$formatters.push(function (value) {
            self.onExternalChange(value);
            return value;
        });

    };
    ImagePickerCtrl.prototype.onExternalChange = function (value) {

        this.mdInputContainer && this.mdInputContainer.setHasValue(!!value);
        if (!value || angular.isUndefined(this.multiple)) {
            return;
        }

        if (this.multiple) {
            this.selected = angular.isArray(value) ? this.getValue(value) : this.getValue([value]);
        } else {
            this.selected = this.getValue(value);
        }
    };
    ImagePickerCtrl.prototype.getValue = function (value) {
        var result = null;
        if (angular.isArray(value)) {
            result = [];
            value.forEach(function (item) {
                if (angular.isObject(item) && item['id'])
                    result.push(item.id);
                else if (angular.isNumber(item))
                    result.push(item);
                else
                    throw new Error('Ivalid image. Please give the id of image or image object content the id');
            }, result);
            return result;
        }
        if (angular.isObject(value) && value['id'])
            result = value.id;
        else if (angular.isNumber(value))
            result = value;
        else
            throw new Error('Ivalid image. Please give the id of image or image object content the id');
        return result;
    };
    ImagePickerCtrl.prototype.thumbUrl = function (id) {
        if (!id || !angular.isNumber(id))
            return;

        var pwidth = this.disabled ? 150 : 50, pheight = this.disabled ? 150 : 50;
        if (!this.multiple)
            var pwidth = this.disabled ? 200 : 100, pheight = this.disabled ? 200 : 100;
        return BaseUrl + '/file/thumb/' + id + '/' + pwidth + '/' + pheight;
    };
    ImagePickerCtrl.prototype.isSingleSelected = function () {
        return !this.multiple && this.selected;
    };
    ImagePickerCtrl.prototype.isMultipleSelected = function () {
        return this.multiple && angular.isArray(this.selected) && this.selected.length > 0;
    };
    ImagePickerCtrl.prototype.setValue = function (value) {
        this.mdInputContainer && this.mdInputContainer.setHasValue(!!value);
        if (this.multiple) {
            if (angular.isArray(value) && value.length > 0) {
                value.forEach(function (img, i) {
                    if (!img)
                        this.splice(i, 1);
                    else
                        this[i] = img.id || img;
                }, value);
                this.selected = value;
            }
            else
                this.selected = [];
        } else
            this.selected = value ? value.id || value : null;


        this.ngModelCtrl.$viewValue = this.selected;
        this.ngModelCtrl.$commitViewValue();

        if (this.ngModelCtrl.$invalid)
            this.mdInputContainer.label.addClass('ng-invalid');
        if (this.ngModelCtrl.$valid)
            this.mdInputContainer.label.removeClass('ng-invalid');
    };

    /*** Operations *****/
    ImagePickerCtrl.prototype.replace = function () {
        if (this.multiple)
            throw new Error('Can\'t execute replace operation in multiple mode');
        var self = this;
        this.dialog.showSingle(angular.copy(this.selected), this.required)
            .then(function (selected) {
                self.setValue(selected);
            }, function (result) {
            });
    };
    ImagePickerCtrl.prototype.push = function () {
        if (!this.multiple)
            throw new Error('Can\'t execute push operation in single mode');
        var self = this;
        this.dialog.showMultiple(angular.copy(this.selected), this.required)
            .then(function (selected) {
                self.setValue(selected);
            }, function (result) {
            });
    };
    ImagePickerCtrl.prototype.remove = function (item) {
        if (this.multiple)
            _.remove(this.selected, function (i) {
                return i.id == item.id;
            });
        else
            this.selected = null;
    };


    ImagePickerCtrl.$inject = ['$scope', '$attrs', 'AbImageSelect'];
    return {
        restrict: 'E',
        templateUrl: 'app/views/form/imagepicker.html',
        require: ['^?mdInputContainer', '?ngModel', '?^form', 'abImagePicker'],
        controller: ImagePickerCtrl,
        controllerAs: 'imgPicker',
        link: function (scope, elt, attrs, ctrls) {
            var containerCtrl = ctrls[0];
            var ngModel = ctrls[1] || $mdUtil.fakeNgModel();
            var formCtrl = ctrls[2];
            var mdNoAsterisk = $mdUtil.parseAttributeBoolean(attrs.mdNoAsterisk);
            var imgPicker = ctrls[3];

            imgPicker.configureNgModel(ngModel, containerCtrl, inputDirective);
            imgPicker.init(angular.isDefined(attrs['multiple']) ? true : false, angular.isDefined(attrs['required']) ? true : false);

            /*** Observe attributes ***/
            if (attrs['ngDisabled']) {
                attrs.$observe('disabled', function (v) {
                    imgPicker.disabled = v;
                });
            }
            if (containerCtrl) {

                var spacer = elt[0].querySelector('.md-errors-spacer');

                if (spacer) {
                    elt.after(angular.element('<div>').append(spacer));
                }

                containerCtrl.setHasPlaceholder(attrs.mdPlaceholder);
                containerCtrl.input = elt;

                if (containerCtrl.label.length > 0)
                    containerCtrl.label.addClass('ab-imagepicker-label');

                if (!containerCtrl.label) {
                    $mdAria.expect(element, 'aria-label', attrs.mdPlaceholder);
                } else if (!mdNoAsterisk) {
                    attrs.$observe('required', function (value) {
                        containerCtrl.label.toggleClass('md-required', !!value);
                    });
                }

                scope.$watch(containerCtrl.isErrorGetter || function () {
                        return ngModel.$invalid && (ngModel.$touched || (formCtrl && formCtrl.$submitted));
                    }, containerCtrl.setInvalid);
            }
        }

    }
}

AbImagePicker.$inject = ['$mdUtil', '$mdAria', 'inputDirective', 'BaseUrl', '_'];


/**
 * Ab Image Select Dialog
 */

function AbImageDialogCtrl($scope, multiple, selected, required, Media, BaseUrl, $mdDialog, AbImage, $mdToast, _) {
    this.scope = $scope;
    this.multiple = multiple;
    this.selected = selected;
    this.required = required;
    this.model = Media;
    this.BaseUrl = BaseUrl;
    this.mdDialog = $mdDialog;
    this.image = AbImage;
    this.toast = $mdToast;
    this._ = _;
    this.images = [];
    this.init();
}

AbImageDialogCtrl.prototype.init = function () {
    var self = this;
    if (this.multiple) {
        if (angular.isArray(this.selected))
            this.selected.forEach(function (e, i) {
                if (angular.isUndefined(e.id) && angular.isNumber(e))
                    this[i] = {id: e};
                else if (angular.isUndefined(e.id))
                    this.splice(i, 1);

            }, this.selected);
    }
    if (!this.multiple) {
        if (this.selected && angular.isUndefined(this.selected.id) && angular.isNumber(this.selected))
            this.selected = {id: this.selected};
        else if (!this.selected || angular.isUndefined(this.selected.id))
            this.selected = null;
    }
    //this.selected = this.multiple ? [] : null;
    this.progress = this.model
        .all()
        .then(function (response) {
            self.setUp(response);
        })
};
AbImageDialogCtrl.prototype.setUp = function (response) {
    response = response.data || response;
    this.images = [];
    var self = this, width = 400, height = 400;
    response.forEach(function (item) {
        item.url = self.BaseUrl + '' + item.path;
        item.thumbUrl = self.BaseUrl + '/file/thumb/' + item.id + '/' + width + '/' + height;
        item.imgProgress = self.image.load(item.thumbUrl);
        this.push(item);
    }, this.images);
};
AbImageDialogCtrl.prototype.handleMessage = function (message, type) {
    var toast = null;
    switch (type) {
        case 'success':
            toast = this.toast.success();
            break;
        case 'warning':
            toast = this.toast.warning();
            break;
        case 'danger':
            toast = this.toast.danger();
            break;
        default:
            toast = this.toast.simple();
    }
    if (toast)
        this.toast.show(
            toast
                .content(message)
                .hideDelay(2500)
                .position('top right')
        );
};

//// Selection /////
AbImageDialogCtrl.prototype.selectedAction = function () {
    if (this.multiple)
        return angular.isArray(this.selected) && this.selected.length > 0;
    return angular.isDefined(this.selected) && this.selected != null;
};
AbImageDialogCtrl.prototype.allSelected = function () {
    if (!this.multiple || !angular.isArray(this.images))
        return false;
    return angular.isArray(this.selected) && this.selected.length == this.images.length;
};
AbImageDialogCtrl.prototype.toggleAllSelect = function (e) {
    if (e && e.stopPropagation) {
        e.stopPropagation();
    }
    var self = this;
    if (this.allSelected())
        angular.forEach(this.images, function (item) {
            if (self.isSelected(item))
                self.deselect(item);
        });
    else
        angular.forEach(this.images, function (item) {
            if (!self.isSelected(item))
                self.select(item);
        });
};
AbImageDialogCtrl.prototype.isSelected = function (item) {
    if (!this.selected || (angular.isArray(this.selected) && this.selected.length <= 0))
        return false;
    if (this.multiple) {
        if (!angular.isArray(this.selected) || this.selected.length <= 0)
            return false;
        return this._.findIndex(this.selected, function (s) {
                return s.id == item.id;
            }) !== -1;
    }
    return this.selected.id == item.id;
};
AbImageDialogCtrl.prototype.select = function (item) {
    if (this.multiple)
        this.selected.push(item);
    else
        this.selected = item;
};
AbImageDialogCtrl.prototype.deselect = function (item) {
    if (this.multiple) {
        var pos = this._.findIndex(this.selected, function (s) {
            return s.id == item.id;
        });
        if (pos != -1)
            this.selected.splice(pos, 1);
    } else
        this.selected = null;
};
AbImageDialogCtrl.prototype.toggleSelect = function (item, event) {
    if (event && event.stopPropagation) {
        event.stopPropagation();
    }
    return this.isSelected(item) ? this.deselect(item) : this.select(item);
};

///// CRUD /////////
AbImageDialogCtrl.prototype.delete = function (item) {
    if (!item)
        return;
    var self = this;
    var confirm = this.mdDialog.confirm({
        textContent: 'Supprimer cet image?',
        ok: 'Supprimer',
        cancel: 'Annuler',
        multiple: true
    });

    this.mdDialog
        .show(confirm)
        .then(function (confirm) {
            if (confirm) {
                self.progress = self.model.delete(item.id || item)
                    .then(function (response) {
                        if (!response) {
                            self.handleMessage('Impossible de supprimer "' + item.title || item.file_name || item + '"', 'danger');
                            return;
                        }

                        if (self.isSelected(item))
                            self.deselect(item);
                        self._.remove(self.images, function (img) {
                            return img.id == item.id;
                        });
                        self.handleMessage('"' + item.title || item.file_name || item + '" supprimé avec succés', 'success');
                    });
            }
        }, function (reject) {
        })
        .finally(function () {
            confirm = undefined;
        });
};
AbImageDialogCtrl.prototype.refresh = function () {
    var self = this;
    this.progress = this.model.all()
        .then(function (response) {
            self.setUp(response);
        })
};
AbImageDialogCtrl.prototype.upload = function () {
    this.mdDialog.show({
        templateUrl: 'app/views/settings/medias/form.html',
        locals: {
            parentCtrl: this
        },
        multiple: true,
        controller: AbImageSelectCtrls.uploadCtrl
    });
};

//// Dialog /////
AbImageDialogCtrl.prototype.close = function () {
    this.mdDialog.hide(this.selected);
};
AbImageDialogCtrl.prototype.emptyClose = function () {
    if (this.required)
        return;
    this.mdDialog.hide(this.multiple ? [] : null);
};
AbImageDialogCtrl.prototype.cancel = function () {
    this.mdDialog.cancel();
};


/**** Upload Dialog ****/
function AbImageUploadCtrl($scope, parentCtrl, $mdDialog, ApiBaseUrl) {
    $scope.uploadUrl = ApiBaseUrl + 'medias';
    $scope.closeDialog = function () {
        $mdDialog.hide();
    };
    $scope.uploadComplete = function (content) {
        parentCtrl.refresh();
        $mdDialog.hide();
    };
    $scope.onError = function (error) {
        console.log(error);
        $scope.error = true;
    }
}


var AbImageSelectCtrls = {
    dialogCtrl: ['$scope', 'multiple', 'selected', 'required', 'Media', 'BaseUrl', '$mdDialog', 'AbImage', '$mdToast', '_',
        AbImageDialogCtrl
    ],
    uploadCtrl: ['$scope', 'parentCtrl', '$mdDialog', 'ApiBaseUrl', AbImageUploadCtrl]
};


angular.module('AbouEventAdmin')
    .service('AbImageSelect', AbImageSelect);
function AbImageSelect($mdDialog, _) {
    return {
        showSingle: function (selected, required) {
            required = angular.isUndefined(required) || !_.isBoolean(required) ? false : required;
            var parentEl = angular.element(document.body);
            return $mdDialog.show({
                parent: parentEl,
                templateUrl: 'app/views/form/imagedialog.html',
                locals: {
                    multiple: false,
                    selected: selected,
                    required: required
                },
                controller: AbImageSelectCtrls.dialogCtrl,
                controllerAs: 'ctrl'
            });
        },
        showMultiple: function (selected, required) {
            required = angular.isUndefined(required) || !_.isBoolean(required) ? false : required;
            var parentEl = angular.element(document.body);
            return $mdDialog.show({
                parent: parentEl,
                templateUrl: 'app/views/form/imagedialog.html',
                locals: {
                    multiple: true,
                    selected: selected,
                    required: required
                },
                controller: AbImageSelectCtrls.dialogCtrl,
                controllerAs: 'ctrl'
            });
        }
    }
}

AbImageSelect.$inject = ['$mdDialog', '_'];