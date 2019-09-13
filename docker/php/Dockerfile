FROM ubuntu:18.04

RUN ln -snf /usr/share/zoneinfo/Africa/Ndjamena /etc/localtime

RUN apt update && apt install -my php7.2

RUN apt-get install -my \
  curl \
  wget \
  zip \
  git \
  php7.2-bcmath \
  php7.2-json \
  php7.2-curl \
  php7.2-fpm \
  php7.2-mysql \
  php7.2-gd \
  php7.2-xsl \
  php7.2-intl \
  php7.2-bz2 \
  php7.2-zip \
  php7.2-mbstring \
  php7.2-apcu \
  php7.2-redis \
  php7.2-opcache \
  php7.2-xml \
  php-tokenizer

RUN mkdir /run/php
ADD conf/www.conf /etc/php/7.2/fpm/pool.d/www.conf
ADD conf/php-fpm.conf /etc/php/7.2/fpm/php-fpm.conf

ADD xdebug.so /usr/lib/php/20170718/xdebug.so
ADD xdebug.ini /etc/php/7.2/mods-available/xdebug.ini
RUN phpenmod xdebug

RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
RUN php composer-setup.php
RUN php -r "unlink('composer-setup.php');"
RUN mv composer.phar /usr/local/bin/composer
RUN chmod +x /usr/local/bin/composer

WORKDIR /var/www/html/abouevent
EXPOSE 9000
CMD ["php-fpm7.2"]
