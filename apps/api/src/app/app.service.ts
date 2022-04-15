import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, forkJoin, from, map, of, switchMap, tap } from 'rxjs';
import { CheerioAPI, load } from 'cheerio';
import * as puppeteer from 'puppeteer';

@Injectable()
export class AppService {
  constructor(private http: HttpService) {}
  baseUrl: 'https://www.rtp.pt/play/bg_l_ep/';

  getEps(pageNr: number): any {
    const stamp = new Date().getTime().toString().slice(0, 6);
    console.log(stamp);

    return this.http
      .get(
        `https://www.rtp.pt/play/bg_l_ep/?stamp=${stamp}&listDate=&listQuery=&listProgram=257&listcategory=&listchannel=&listtype=recent&page=${pageNr}&type=radio&currentItemSelected=610824&listbroadcaster=
      `,
        {
          headers: {
            accept: '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language':
              'pt-PT,pt;q=0.9,en-GB;q=0.8,en;q=0.7,en-US;q=0.6',
            cookie:
              'rtp_privacy=1649957164096; rtp_cookie_parental=0; _ga=GA1.2.388578232.1649957165; _gid=GA1.2.233064254.1649957165; __gfp_64b=rU3BbNt.op9dRY4M45ch9WqltPY9jCQfx_7vXo.pX0b.e7|1649957164; undefined=16RZWZ164-392RZW464-ZTY499571-2186RZW10; rtp_cookie_privacy=permit 1,2,3,4; googlepersonalization=1; euconsent-v2=CPXc3u6PXc3u6DBABBPTCKCsAP_AAH_AAB6YIqtd_X__bX9n-_7__ft0eY1f9_r3_-QzjhfNt-8F3L_W_L0X_2E7NF36tq4KuR4ku3bBIQNtHMnUTUmxaolVrzHsak2cpyNKJ7LkknsZe2dYGH9Pn9lD-YKZ7_5___f53z___9_-39z3_9f___d__-__-vjf_599n_v9f3_____________-_______gimASYal5AF2JY4Mm0aRQogRhWEhVAoAKKAYWiKwAcHBTsrAJ9QQsAEAqAjAiBBiCjBgEAAgEASERASAFggEQBEAgABAAiAQgAImAQWAFgYBAAKAaFiAFAAIEhBkUERymBARIlFBLZWIJQV7GmEAZZYAUCiMioAESAAAkDISFg5jgCQEuFkgSYoXyAEYAAAAA.YAAAAAAAAAAA',
            dnt: '1',
            referer: 'https://www.rtp.pt/play/p257/',
            'sec-ch-ua':
              '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest',
          },
        }
      )
      .pipe(
        switchMap((r) => {
          const $: CheerioAPI = load((<any>r).data);

          const epsUrls = $('.vod-audio')
            .toArray()
            .map((element) => $(element).attr('href'));

          const audios = epsUrls.map(async (u) => {
            // Open Browser
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            page.setViewport({ width: 1280, height: 926 });

            // Open Ep page
            await page.goto(`https://www.rtp.pt${u}`, {
              waitUntil: 'networkidle2',
            });
            const content = await page.content();

            const $: CheerioAPI = load(content);

            return {
              url: $('.rmp-dl-link').attr('href'),
              label: $('.rmp-container').attr('aria-label'),
              thumb: $('link[itemprop=thumbnail]').attr('href'),
              duration: $('.addon-result').text(),
            };
          });
          return forkJoin(audios);
        }),

        catchError((err) => {
          console.log(err);

          return of(err);
        })
      );
  }
}
