# Beetter Platform

Beetter, blockchain tabanlı bir bahis ve seçim platformudur. Platform üzerinde kullanıcılar çeşitli oyunlara katılabilir, seçimlerde oy kullanabilir ve tahminlerde bulunabilirler.

## Özellikler

### 🎮 Oyunlar

- **Hackpot**: Token ödüllü hackathon yarışması
- **Coin Flip**: Yazı-tura bahis oyunu

### 🗳️ Seçim Sistemi

- **Komite Seçimleri**: 6 farklı komite için oy kullanma
  - Delegasyon
  - Tasarım
  - Geliştirme
  - Marketing
  - Araştırma
  - Eğitim ve İçerik
- **Seçim Tahminleri**: Seçim sonuçları için bahis yapma imkanı

## Teknolojiler

- Solidity ^0.8.26
- Chainlink VRF (Rastgele Sayı Üretimi)
- Chainlink Automation (Otomatik İşlemler)
- OpenZeppelin Contracts
- Ethers.js
- HTML/CSS/JavaScript
- Live Server plugin

## Akıllı Kontratlar

- `token.sol`: BEE Token (ERC20) kontratı
- `hackpot.sol`: Hackathon bahis sistemi
- `coinflip.sol`: Yazı-tura oyunu
- `election.sol`: Komite seçim sistemi
- `electionPredict.sol`: Seçim tahmin sistemi

## Arayüz

- `index.html`: Ana sayfa
- `intro.html`: Platform tanıtımı
- `menu.html`: Ana menü
- `hackpot.html`: Hackpot oyunu arayüzü
- `flip.html`: Coin Flip oyunu arayüzü
- `vote-election.html`: Seçim oy verme arayüzü
- `vote.html`: Seçim tahmin arayüzü
- `winners.html`: Seçim sonuçları sayfası

## Güvenlik Özellikleri

- Chainlink VRF ile güvenli rastgele sayı üretimi
- ERC20Permit ile gasless onaylama
- Çoklu imza yönetici işlemleri
- Zaman kilitleri

## Kurulum

1. Repository'yi klonlayın
2. `npm install` ile gerekli paketleri yükleyin
3. kontratları arbitrum sepolia ağına dağıtın
4. coinflip.sol ve hack.sol dosyalarını vrf sistemine entegre edin
5. coinflip.sol ve hack.sol kontratlarında verifyForVRF ile vrf ve automationdaki işlemleri gerçekleştriecek adreslere yetki verin
6. coinflip.sol ve hack.sol kontratlarında ilk requestRandomWords fonksiyonunu chainlink automation ile çalıştırın ardından ise oyunu sonuçlandıracak selectWinner fonksiyonunu da chainlink automation ile çalıştırın (Not: ikisinin de süresini 1 dakika olarak belirleyin)
7. html dosyalarındaki 0x0000000000000000000000000000000000000000 adreslerini kontratlarınızın adresleriyle değiştirin
8. index.html dosyasını açın ve live server plugin ile çalıştırın