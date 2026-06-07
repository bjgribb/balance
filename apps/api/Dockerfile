FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY api.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/out
RUN dotnet tool install --tool-path /dotnet-tools dotnet-ef \
    && /dotnet-tools/dotnet-ef migrations bundle --self-contained -r linux-x64 --project api.csproj --output /app/out/efbundle

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/out ./out
RUN chmod +x /app/out/efbundle
